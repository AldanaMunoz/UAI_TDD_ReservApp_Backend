import admin from "../firebase";
import { withTx } from "../db/tx";
import UserModel from "../models/UserModel";
import PersonModel from "../models/PersonModel";
import EmployeeModel from "../models/EmployeeModel";
import UserRoleModel from "../models/UserRoleModel";
import type { IUser } from "../interfaces/UserInterface";
import type { IPerson } from "../interfaces/PersonInterface";
import type { IEmployee } from "../interfaces/EmployeeInterface";
import db from "../db/db";

export async function listUserBundles() {
    const [rows] = await db.execute(
        `SELECT
            u.id, u.email, u.activo,
            p.nombre, p.apellido,
            e.turno, e.tipo,
            COALESCE(GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.nombre SEPARATOR ', '), '') AS roles,
            COALESCE(GROUP_CONCAT(DISTINCT ur.id_rol ORDER BY ur.id_rol), '') AS roleIds
         FROM usuarios u
         LEFT JOIN personas p ON p.id_usuario = u.id
         LEFT JOIN empleados e ON e.id_persona = p.id
         LEFT JOIN usuarios_roles ur ON ur.id_usuario = u.id
         LEFT JOIN roles r ON r.id = ur.id_rol
         GROUP BY u.id, u.email, u.activo, p.nombre, p.apellido, e.turno, e.tipo
         ORDER BY u.id DESC`
    );

    return (rows as any[]).map((row) => ({
        ...row,
        roleIds: row.roleIds ? String(row.roleIds).split(",").map(Number) : [],
    }));
}

/**
 * Crea usuario, persona, empleado y roles en una misma transaccion.
 * Tambien crea el usuario en Firebase y hace rollback si algo falla.
 */
export async function createUserBundle(payload: {
    user: Pick<IUser, "email" | "password"> & { activo?: 0 | 1 };
    person: Pick<IPerson, "nombre" | "apellido">;
    employee: Pick<IEmployee, "turno" | "tipo">;
    roles: number[];
}) {
    const { user, person, employee, roles } = payload;
    const uniqueRoleIds = [...new Set(roles)];

    const fb = await admin.auth().createUser({
        email: user.email,
        password: user.password,
    });
    const firebaseUID = fb.uid;

    try {
        const result = await withTx(async (conn) => {
            const newUser = await UserModel.create(
                {
                    ...user,
                    activo: user.activo ?? 1,
                    firebaseUID,
                    roleId: uniqueRoleIds[0],
                } as IUser,
                conn
            );
            if (!newUser) throw new Error("No se pudo crear usuario");

            const newPerson = await PersonModel.create(
                { id_usuario: newUser.id!, ...person, activo: 1 } as IPerson,
                conn
            );
            if (!newPerson) throw new Error("No se pudo crear persona");

            const newEmployee = await EmployeeModel.create(
                { id_persona: newPerson.id!, ...employee } as IEmployee,
                conn
            );
            if (!newEmployee) throw new Error("No se pudo crear empleado");

            const assignedRoles = [];
            for (const roleId of uniqueRoleIds) {
                const assigned = await UserRoleModel.create(
                    { userId: newUser.id!, roleId },
                    conn
                );
                assignedRoles.push(assigned);
            }

            return {
                user: newUser,
                person: newPerson,
                employee: newEmployee,
                roles: assignedRoles,
                firebaseUID,
            };
        });

        return result;
    } catch (e) {
        try {
            await admin.auth().deleteUser(firebaseUID);
        } catch {
            // Ignorar error si el usuario no existe en Firebase.
        }
        throw e;
    }
}

/**
 * Actualiza usuario, persona y empleado en una misma transaccion.
 * No toca Firebase salvo cambios de email/password.
 */
export async function updateUserBundle(
    idUsuario: number,
    payload: {
        user?: Partial<Pick<IUser, "email" | "password" | "activo" | "roleId">>;
        person?: Partial<Pick<IPerson, "nombre" | "apellido" | "activo">>;
        employee?: Partial<Pick<IEmployee, "turno" | "tipo">>;
        roles?: number[];
    }
) {
    const { user: userPatch, person: personPatch, employee: employeePatch, roles } = payload;

    return await withTx(async (conn) => {
        const dbUser = await UserModel.findById(idUsuario, conn);
        if (!dbUser) throw new Error("Usuario no encontrado");

        const firebaseUID = dbUser.firebaseUID;

        if (firebaseUID && (userPatch?.email || userPatch?.password)) {
            await admin.auth().updateUser(firebaseUID, {
                email: userPatch.email,
                password: userPatch.password,
            });
        }

        const persons = await PersonModel.findByUserId(idUsuario, conn);
        if (!persons.length) throw new Error("Persona asociada no encontrada");
        const dbPerson = persons[0];

        const employees = employeePatch
            ? await EmployeeModel.findByPersona(dbPerson.id!, conn)
            : [];

        let updatedUser = dbUser;
        let updatedPerson = dbPerson;
        let updatedEmployee = employees[0];

        if (userPatch && Object.keys(userPatch).length) {
            const u = await UserModel.updatePartial(dbUser.id!, userPatch as any, conn);
            if (!u) throw new Error("No se pudo actualizar usuario");
            updatedUser = u;
        }

        if (personPatch && Object.keys(personPatch).length) {
            const p = await PersonModel.updatePartial(dbPerson.id!, personPatch as any, conn);
            if (!p) throw new Error("No se pudo actualizar persona");
            updatedPerson = p;
        }

        if (employeePatch && employees[0]) {
            const emp = await EmployeeModel.updatePartial(
                employees[0].id!,
                employeePatch as any,
                conn
            );
            if (!emp) throw new Error("No se pudo actualizar empleado");
            updatedEmployee = emp;
        }

        let assignedRoles = await UserRoleModel.findByUserId(idUsuario, conn);
        if (roles?.length) {
            const uniqueRoleIds = [...new Set(roles)];
            await conn.execute(
                `DELETE FROM usuarios_roles WHERE id_usuario = :idUsuario`,
                { idUsuario }
            );
            for (const roleId of uniqueRoleIds) {
                await UserRoleModel.create({ userId: idUsuario, roleId }, conn);
            }
            await UserModel.updatePartial(idUsuario, { roleId: uniqueRoleIds[0] } as any, conn);
            assignedRoles = await UserRoleModel.findByUserId(idUsuario, conn);
        }

        return { user: updatedUser, person: updatedPerson, employee: updatedEmployee, roles: assignedRoles };
    });
}

/**
 * Elimina usuario, persona y empleados en una misma transaccion.
 * Luego elimina el usuario en Firebase si tiene firebaseUID.
 */
export async function deleteUserBundle(idUsuario: number) {
    const { firebaseUID } = await withTx(async (conn) => {
        const user = await UserModel.findById(idUsuario, conn);
        if (!user) throw new Error("Usuario no encontrado");

        const firebaseUID = user.firebaseUID || null;

        const persons = await PersonModel.findByUserId(idUsuario, conn);
        if (!persons.length) throw new Error("Persona asociada no encontrada");
        const person = persons[0];

        const employees = await EmployeeModel.findByPersona(person.id!, conn);

        for (const emp of employees) {
            await EmployeeModel.hardDelete(emp.id!, conn);
        }

        const okPerson = await PersonModel.hardDelete(person.id!, conn);
        if (!okPerson) throw new Error("No se pudo eliminar la persona");

        const okUser = await UserModel.hardDelete(idUsuario, conn);
        if (!okUser) throw new Error("No se pudo eliminar el usuario");

        return { firebaseUID };
    });

    if (firebaseUID) {
        try {
            await admin.auth().deleteUser(firebaseUID);
        } catch (e: any) {
            const code = e?.errorInfo?.code || e?.code;
            if (code !== "auth/user-not-found") {
                console.error("Error eliminando usuario en Firebase:", e);
            }
        }
    }

    return {
        ok: true,
        message: "Usuario, persona y empleado(s) eliminados correctamente",
        firebaseUIDDeleted: firebaseUID || null,
    };
}

import admin from "../firebase";
import { withTx } from "../db/tx";
import UserModel from "../models/UserModel";
import PersonModel from "../models/PersonModel";
import EmployeeModel from "../models/EmployeeModel";
import type { IUser } from "../interfaces/UserInterface";
import type { IPerson } from "../interfaces/PersonInterface";
import type { IEmployee } from "../interfaces/EmployeeInterface";

/**
 * Crea usuario, persona y empleado en una misma transacción.
 * También crea el usuario en Firebase y hace rollback si algo falla.
 */
export async function createUserBundle(payload: {
    user: Pick<IUser, "email" | "password"> & { activo?: 0 | 1 };
    person: Pick<IPerson, "nombre" | "apellido">;
    employee: Pick<IEmployee, "turno" | "tipo">;
}) {
    const { user, person, employee } = payload;

    // 1️⃣ Crear usuario en Firebase
    const fb = await admin.auth().createUser({
        email: user.email,
        password: user.password,
    });
    const firebaseUID = fb.uid;

    try {
        // 2️⃣ Crear todo en una transacción
        const result = await withTx(async (conn) => {
            const newUser = await UserModel.create(
                { ...user, activo: user.activo ?? 1, firebaseUID } as IUser,
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

            return { user: newUser, person: newPerson, employee: newEmployee, firebaseUID };
        });

        return result;
    } catch (e) {
        // Si algo falla en DB, borramos el usuario de Firebase
        try {
            await admin.auth().deleteUser(firebaseUID);
        } catch {
            /* ignorar error si no existe en firebase */
        }
        throw e;
    }
}

/**
 * Actualiza usuario, persona y empleado en una misma transacción.
 * No toca Firebase (solo DB local).
 */
export async function updateUserBundle(
    idUsuario: number,
    payload: {
        user?: Partial<Pick<IUser, "email" | "password" | "activo">>;
        person?: Partial<Pick<IPerson, "nombre" | "apellido" | "activo">>;
        employee?: Partial<Pick<IEmployee, "turno" | "tipo">>;
    }
) {
    const { user: userPatch, person: personPatch, employee: employeePatch } = payload;

    return await withTx(async (conn) => {
        const dbUser = await UserModel.findById(idUsuario, conn);
        if (!dbUser) throw new Error("Usuario no encontrado");

        const firebaseUID = dbUser.firebaseUID;

        // Si cambia email o password, sincronizar con Firebase también
        if (firebaseUID && (userPatch?.email || userPatch?.password)) {
            await admin.auth().updateUser(firebaseUID, {
                email: userPatch.email,
                password: userPatch.password,
            });
        }

        // Persona
        const persons = await PersonModel.findByUserId(idUsuario, conn);
        if (!persons.length) throw new Error("Persona asociada no encontrada");
        const dbPerson = persons[0];

        const employees = employeePatch
            ? await EmployeeModel.findByPersona(dbPerson.id!, conn)
            : [];

        // Actualizar en DB (usuario / persona / empleado)
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

        return { user: updatedUser, person: updatedPerson, employee: updatedEmployee };
    });
}


/**
 * Elimina usuario + persona + empleado(s) en una misma transacción.
 * Luego elimina el usuario en Firebase (si tiene firebaseUID).
 */
export async function deleteUserBundle(idUsuario: number) {
    const { firebaseUID } = await withTx(async (conn) => {
        // Usuario Base
        const user = await UserModel.findById(idUsuario, conn);
        if (!user) throw new Error("Usuario no encontrado");

        const firebaseUID = user.firebaseUID || null;

        // Persona asociada
        const persons = await PersonModel.findByUserId(idUsuario, conn);
        if (!persons.length) throw new Error("Persona asociada no encontrada");
        const person = persons[0];

        // Empleado asociado a Persona
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

    // Eliminar en Firebase (fuera de la tx)
    if (firebaseUID) {
        try {
            await admin.auth().deleteUser(firebaseUID);
        } catch (e: any) {
            const code = e?.errorInfo?.code || e?.code;
            if (code !== "auth/user-not-found") {
                // si querés podés loguear
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

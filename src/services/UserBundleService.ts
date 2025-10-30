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
            const newUser = await UserModel.create({ ...user, activo: user.activo ?? 1, firebaseUID } as IUser, conn);
            if (!newUser) throw new Error("No se pudo crear usuario");

            const newPerson = await PersonModel.create({ id_usuario: newUser.id!, ...person, activo: 1 } as IPerson, conn);
            if (!newPerson) throw new Error("No se pudo crear persona");

            const newEmployee = await EmployeeModel.create({ id_persona: newPerson.id!, ...employee } as IEmployee, conn);
            if (!newEmployee) throw new Error("No se pudo crear empleado");

            return { user: newUser, person: newPerson, employee: newEmployee, firebaseUID };
        });

        return result;
    } catch (e) {
        // 3️⃣ Si algo falla en DB, borramos el usuario de Firebase
        try {
            await admin.auth().deleteUser(firebaseUID);
        } catch {
            /* ignorar error si no existe en firebase */
        }
        throw e;
    }
}

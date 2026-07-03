import db from "../db/db";
import type { IUser } from "../interfaces/UserInterface";
import type { ResultSetHeader } from "mysql2";
import bcrypt from "bcrypt";

const UserModel = {
    /** Listar */
    async find(exec: any = db): Promise<IUser[]> {
        const [rows] = await exec.execute(
            `SELECT id, email, password, activo, firebaseUID, id_rol AS roleId
             FROM usuarios
             ORDER BY id DESC`
        );
        return rows as unknown as IUser[];
    },

    /** Por ID */
    async findById(id: number | string, exec: any = db): Promise<IUser | undefined> {
        const [rows] = await exec.execute(
            `SELECT id, email, password, activo, firebaseUID, id_rol AS roleId
             FROM usuarios
             WHERE id = :id`,
            { id: Number(id) }
        );
        return (rows as any[])[0] as IUser | undefined;
    },

    /** Por email */
    async findOneByEmail(email: string, exec: any = db): Promise<IUser | undefined> {
        const [rows] = await exec.execute(
            `SELECT id, email, password, activo, firebaseUID, id_rol AS roleId
             FROM usuarios
             WHERE email = :email`,
            { email }
        );
        return (rows as any[])[0] as IUser | undefined;
    },

    /** Por Firebase UID */
    async findOneByFirebaseUID(firebaseUID: string, exec: any = db): Promise<IUser | undefined> {
        const [rows] = await exec.execute(
            `SELECT id, email, password, activo, firebaseUID, id_rol AS roleId
             FROM usuarios
             WHERE firebaseUID = :firebaseUID`,
            { firebaseUID }
        );
        return (rows as any[])[0] as IUser | undefined;
    },

    /** Crear */
    async create(user: IUser, exec: any = db): Promise<IUser | undefined> {
        const hashed = await bcrypt.hash(user.password, 10);

        const [res] = await exec.execute(
            `INSERT INTO usuarios (email, password, activo, firebaseUID, id_rol)
             VALUES (:email, :password, :activo, :firebaseUID, :roleId)`,
            {
                email: user.email,
                password: hashed,
                activo: user.activo ?? 1,
                firebaseUID: user.firebaseUID ?? null,
                roleId: user.roleId ?? 2,
            }
        );

        const insertId = (res as ResultSetHeader).insertId;

        const [rows] = await exec.execute(
            `SELECT id, email, password, activo, firebaseUID, id_rol AS roleId
             FROM usuarios
             WHERE id = :id`,
            { id: insertId }
        );

        return (rows as any[])[0] as IUser | undefined;
    },

    /** Update parcial */
    async updatePartial(
        id: number | string,
        patch: Partial<IUser>,
        exec: any = db
    ): Promise<IUser | undefined> {
        const columnMap: Record<string, string> = {
            email: "email",
            password: "password",
            activo: "activo",
            firebaseUID: "firebaseUID",
            roleId: "id_rol",
        };
        const allowed = Object.keys(columnMap);
        const entries = Object.entries(patch).filter(
            ([k, v]) => allowed.includes(k) && v !== undefined
        );

        if (!entries.length) return this.findById(id, exec);

        if (patch.password) {
            patch.password = await bcrypt.hash(patch.password, 10);
        }

        const setSql = entries.map(([k]) => `${columnMap[k]} = :${k}`).join(", ");
        const params = Object.fromEntries(entries);
        (params as any).id = Number(id);

        await exec.execute(
            `UPDATE usuarios SET ${setSql} WHERE id = :id`,
            params
        );

        return this.findById(id, exec);
    },

    /** Hard delete */
    async hardDelete(id: number | string, exec: any = db): Promise<boolean> {
        const [res] = await exec.execute(
            `DELETE FROM usuarios WHERE id = :id`,
            { id: Number(id) }
        );
        return (res as ResultSetHeader).affectedRows > 0;
    },

    /** Soft delete */
    async setActivo(id: number | string, activo: 0 | 1, exec: any = db): Promise<IUser | undefined> {
        await exec.execute(
            `UPDATE usuarios SET activo = :activo WHERE id = :id`,
            { id: Number(id), activo }
        );
        return this.findById(id, exec);
    },

    /** Comparar password */
    async comparePassword(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    },
};

export default UserModel;

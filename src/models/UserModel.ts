import db from "../db/db";
import type { IUser } from "../interfaces/UserInterface";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcrypt";

const UserModel = {
    /**
     * Obtener todos los usuarios
     */
    async find(): Promise<IUser[]> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT id, email, password, activo, firebaseUID
       FROM usuarios
       ORDER BY id DESC`
        );
        return rows as unknown as IUser[];
    },

    /**
     * Buscar un usuario por su ID
     */
    async findById(id: string | number): Promise<IUser | undefined> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT id, email, password, activo, firebaseUID
       FROM usuarios
       WHERE id = :id`,
            { id: Number(id) }
        );
        return (rows as any[])[0] as IUser | undefined;
    },

    /**
     * Buscar un usuario por su email
     */
    async findOneByEmail(email: string): Promise<IUser | undefined> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT id, email, password, activo, firebaseUID
       FROM usuarios
       WHERE email = :email`,
            { email }
        );
        return (rows as any[])[0] as IUser | undefined;
    },

    /**
     * Buscar un usuario por su firebaseUID
     */
    async findOneByFirebaseUID(firebaseUID: string): Promise<IUser | undefined> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT id, email, password, activo, firebaseUID
       FROM usuarios
       WHERE firebaseUID = :firebaseUID`,
            { firebaseUID }
        );
        return (rows as any[])[0] as IUser | undefined;
    },

    /**
     * Crear un nuevo usuario en la base de datos
     * - Hashea la contraseña antes de guardarla
     */
    async create(user: IUser, exec: any = db): Promise<IUser | undefined> {
        const hashed = await bcrypt.hash(user.password, 10);
        const [res] = (await exec.execute(
            `INSERT INTO usuarios (email, password, activo, firebaseUID)
       VALUES (:email, :password, :activo, :firebaseUID)`,
            {
                email: user.email,
                password: hashed,
                activo: user.activo ?? 1,
                firebaseUID: user.firebaseUID ?? null,
            }
        )) as [ResultSetHeader];
        const [rows] = (await exec.execute(
            `SELECT id, email, password, activo, firebaseUID
       FROM usuarios WHERE id = :id`,
            { id: (res as ResultSetHeader).insertId }
        )) as [RowDataPacket[]];
        return (rows as any[])[0] as IUser | undefined;
    },

    /**
     * Actualizar un usuario parcialmente
     */
    async updatePartial(id: string | number, patch: Partial<IUser>): Promise<IUser | undefined> {
        const allowed = ["email", "password", "activo", "firebaseUID"] as const;

        const entries = Object.entries(patch).filter(([k, v]) => allowed.includes(k as any) && v !== undefined);
        if (!entries.length) return this.findById(id);

        if (patch.password) {
            patch.password = await bcrypt.hash(patch.password, 10);
        }

        const setSql = entries.map(([k]) => `${k} = :${k}`).join(", ");
        const params: any = Object.fromEntries(entries);
        params.id = Number(id);

        await db.execute<ResultSetHeader>(`UPDATE usuarios SET ${setSql} WHERE id = :id`, params);

        return this.findById(id);
    },

    /**
     * Eliminar un usuario físicamente de la DB
     */
    async hardDelete(id: string | number): Promise<boolean> {
        const [res] = await db.execute<ResultSetHeader>(`DELETE FROM usuarios WHERE id = :id`, { id: Number(id) });
        return (res as ResultSetHeader).affectedRows > 0;
    },

    /**
     * Soft delete = cambia el campo activo (0 = inactivo, 1 = activo)
     */
    async setActivo(id: string | number, activo: 0 | 1): Promise<IUser | undefined> {
        await db.execute<ResultSetHeader>(`UPDATE usuarios SET activo = :activo WHERE id = :id`, { id: Number(id), activo });
        return this.findById(id);
    },

    /**
     * Comparar una contraseña en texto plano con el hash almacenado
     */
    async comparePassword(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    },

    /**
     * Obtener roles de un usuario
     */
    async getUserRoles(userId: number): Promise<string[]> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT r.nombre
             FROM roles r
             INNER JOIN usuarios_roles ur ON r.id = ur.id_rol
             WHERE ur.id_usuario = :userId`,
            { userId }
        );
        return (rows as any[]).map((row: any) => row.nombre);
    },
};

export default UserModel;

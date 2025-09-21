import db from "../db/db";
import { IUser } from "../interfaces/UserInterface";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcrypt";

const UserModel = {
  /**
   * Obtener todos los usuarios
   */
  async find(): Promise<IUser[]> {
    // db.execute devuelve [rows, fields]
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, email, password, activo, firebaseUID
       FROM usuarios
       ORDER BY id DESC`
    );
    // devolvemos el array de usuarios casteado a IUser[]
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
    // devolvemos solo el primer resultado (o undefined si no existe)
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
   * Crear un nuevo usuario en la base de datos
   * - Hashea la contraseña antes de guardarla
   */
  async create(user: IUser): Promise<IUser | undefined> {
    // Hashear la contraseña antes de insertarla
    const hashed = await bcrypt.hash(user.password, 10);

    // Ejecutamos el INSERT
    const [res] = await db.execute<ResultSetHeader>(
      `INSERT INTO usuarios (email, password, activo, firebaseUID)
       VALUES (:email, :password, :activo, :firebaseUID)`,
      {
        email: user.email,
        password: hashed,
        activo: user.activo ?? 1,
        firebaseUID: user.firebaseUID ?? null,
      }
    );

    // Obtenemos el nuevo usuario usando el insertId
    return this.findById((res as ResultSetHeader).insertId);
  },

  /**
   * Actualizar un usuario parcialmente
   * - Permite modificar uno o varios campos
   * - Si viene password, se hashea antes de guardarla
   */
  async updatePartial(id: string | number, patch: Partial<IUser>): Promise<IUser | undefined> {
    // Campos permitidos para update
    const allowed = ["email", "password", "activo", "firebaseUID"] as const;

    // Filtrar solo los campos válidos y con valor
    const entries = Object.entries(patch).filter(
      ([k, v]) => allowed.includes(k as any) && v !== undefined
    );
    if (!entries.length) return this.findById(id);

    // Si hay password, la hasheamos
    if (patch.password) {
      patch.password = await bcrypt.hash(patch.password, 10);
    }

    // Construir el SET dinámico: ej "email = :email, activo = :activo"
    const setSql = entries.map(([k]) => `${k} = :${k}`).join(", ");

    // Armar parámetros para la query
    const params: any = Object.fromEntries(entries);
    params.id = Number(id);

    // Ejecutar UPDATE
    await db.execute<ResultSetHeader>(
      `UPDATE usuarios SET ${setSql} WHERE id = :id`,
      params
    );

    // Devolver el usuario actualizado
    return this.findById(id);
  },

  /**
   * Eliminar un usuario físicamente de la DB
   */
  async hardDelete(id: string | number): Promise<boolean> {
    const [res] = await db.execute<ResultSetHeader>(
      `DELETE FROM usuarios WHERE id = :id`,
      { id: Number(id) }
    );
    return (res as ResultSetHeader).affectedRows > 0;
  },

  /**
   * Soft delete = cambia el campo activo (0 = inactivo, 1 = activo)
   */
  async setActivo(id: string | number, activo: 0 | 1): Promise<IUser | undefined> {
    await db.execute<ResultSetHeader>(
      `UPDATE usuarios SET activo = :activo WHERE id = :id`,
      { id: Number(id), activo }
    );
    return this.findById(id);
  },

  /**
   * Comparar una contraseña en texto plano con el hash almacenado
   */
  async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  },
};

export default UserModel;

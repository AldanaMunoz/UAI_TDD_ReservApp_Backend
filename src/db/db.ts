import mysql from "mysql2/promise";
import type { Pool } from "mysql2/promise";

// Creamos el pool de conexiones
const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

// Función para probar la conexión a la base de datos
export async function connect() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log("✅ Conexión exitosa a la base de datos");
}

export default pool;

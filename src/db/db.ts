import mysql, { Pool } from "mysql2/promise";

// Crear el pool
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

// Agregar la función connect al pool
async function connect() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log("✅ Conexión exitosa a la base de datos");
}

// Exportar un objeto que tenga tanto el pool como la función
const db = {
  ...pool,   // propiedades/métodos del pool (execute, query, etc.)
  connect,   // nuestra función de test de conexión
};

export default db;

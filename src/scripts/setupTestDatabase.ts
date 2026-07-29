import "dotenv/config";
import mysql from "mysql2/promise";

const sourceDatabase = process.env.DB_NAME || "reservapp";
const testDatabase = process.env.TEST_DB_NAME || "reservapp_test";
const safeName = /^[A-Za-z0-9_]+$/;

if (!safeName.test(sourceDatabase) || !safeName.test(testDatabase) || sourceDatabase === testDatabase) {
  throw new Error("DB_NAME y TEST_DB_NAME deben ser identificadores distintos y seguros");
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${testDatabase}\``);
    const [rows] = await connection.query<any[]>(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
       ORDER BY TABLE_NAME`,
      [sourceDatabase],
    );

    for (const { TABLE_NAME: table } of rows) {
      if (!safeName.test(table)) throw new Error(`Nombre de tabla invalido: ${table}`);
      await connection.query(
        `CREATE TABLE IF NOT EXISTS \`${testDatabase}\`.\`${table}\` LIKE \`${sourceDatabase}\`.\`${table}\``,
      );
    }
    console.log(`Base ${testDatabase} lista con ${rows.length} tablas vacias.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

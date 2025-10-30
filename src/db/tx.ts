// src/db/tx.ts
import pool from "./db";

/**
 * Envuelve una transacción sobre la MISMA conexión.
 */
export async function withTx<T>(fn: (conn: any) => Promise<T>): Promise<T> {
    const conn = await (pool as any).getConnection();
    try {
        await conn.beginTransaction();
        const out = await fn(conn);
        await conn.commit();
        return out;
    } catch (e) {
        try {
            await conn.rollback();
        } catch {}
        throw e;
    } finally {
        try {
            conn.release();
        } catch {}
    }
}

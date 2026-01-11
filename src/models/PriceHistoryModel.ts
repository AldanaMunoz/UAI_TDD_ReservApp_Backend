import db from "../db/db";
import type { ResultSetHeader } from "mysql2";
import type { IPriceHistory } from "../interfaces/PriceHistoryInterface";

const TABLE = "historicos_precios";

const PriceHistoryModel = {
  async find(exec: any = db): Promise<IPriceHistory[]> {
    const [rows] = await exec.execute(
      `SELECT
        id,
        precio       AS price,
        fecha_inicio AS startDate,
        fecha_desde  AS fromDate
      FROM ${TABLE}
      ORDER BY fecha_inicio DESC, id DESC`
    );
    return rows as unknown as IPriceHistory[];
  },

  async findById(id: number | string, exec: any = db): Promise<IPriceHistory | undefined> {
    const [rows] = await exec.execute(
      `SELECT
        id,
        precio       AS price,
        fecha_inicio AS startDate,
        fecha_desde  AS fromDate
      FROM ${TABLE}
      WHERE id = :id`,
      { id: Number(id) }
    );

    const list = rows as IPriceHistory[];
    return list.length ? list[0] : undefined;
  },

  async create(data: IPriceHistory, exec: any = db): Promise<IPriceHistory | undefined> {
    const [res] = await exec.execute(
      `INSERT INTO ${TABLE} (precio, fecha_inicio, fecha_desde)
       VALUES (:price, :startDate, :fromDate)`,
      {
        price: data.price,
        startDate: data.startDate,
        fromDate: data.fromDate ?? null,
      }
    );

    const insertId = (res as ResultSetHeader).insertId;
    return this.findById(insertId, exec);
  },

  async updatePartial(
    id: number | string,
    patch: Partial<IPriceHistory>,
    exec: any = db
  ): Promise<IPriceHistory | undefined> {
    const entries: Array<[string, any]> = [];
    if (patch.price !== undefined) entries.push(["precio", patch.price]);
    if (patch.startDate !== undefined) entries.push(["fecha_inicio", patch.startDate]);
    if (patch.fromDate !== undefined) entries.push(["fecha_desde", patch.fromDate ?? null]);

    if (!entries.length) return this.findById(id, exec);

    const setSql = entries.map(([col], idx) => `${col} = :v${idx}`).join(", ");
    const params: any = { id: Number(id) };
    entries.forEach(([, val], idx) => (params[`v${idx}`] = val));

    await exec.execute(
      `UPDATE ${TABLE}
       SET ${setSql}
       WHERE id = :id`,
      params
    );

    return this.findById(id, exec);
  },

  async hardDelete(id: number | string, exec: any = db): Promise<boolean> {
    const [res] = await exec.execute(
      `DELETE FROM ${TABLE}
       WHERE id = :id`,
      { id: Number(id) }
    );

    return (res as ResultSetHeader).affectedRows > 0;
  },
};

export default PriceHistoryModel;

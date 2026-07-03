// src/models/ReservationModel.ts
import db from "../db/db";
import type { IReservation } from "../interfaces/ReservationInterface";
import type { ResultSetHeader } from "mysql2";

const TABLE = "reservas";

const ReservationModel = {
  /** List all reservations */
  async find(exec: any = db): Promise<IReservation[]> {
    const [rows] = await exec.execute(
      `SELECT
          id,
          id_usuario          AS userId,
          id_liquidacion      AS liquidationId,
          fecha_reservada     AS reservedAt,
          fecha_cancelacion   AS cancelledAt,
          id_comida_entrada   AS starterFoodId,
          id_comida_principal AS mainFoodId,
          id_comida_postre    AS dessertFoodId,
          id_comida_bebida    AS drinkFoodId,
          codigo_qr           AS qrCode,
          estado_reserva      AS reservationStatus,
          estado_liquidacion  AS liquidationStatus,
          id_historico_precio AS priceHistoryId
       FROM ${TABLE}
       ORDER BY id DESC`
    );

    return rows as unknown as IReservation[];
  },

  /** Find by ID */
  async findById(id: number | string, exec: any = db): Promise<IReservation | undefined> {
    const [rows] = await exec.execute(
      `SELECT
          id,
          id_usuario          AS userId,
          id_liquidacion      AS liquidationId,
          fecha_reservada     AS reservedAt,
          fecha_cancelacion   AS cancelledAt,
          id_comida_entrada   AS starterFoodId,
          id_comida_principal AS mainFoodId,
          id_comida_postre    AS dessertFoodId,
          id_comida_bebida    AS drinkFoodId,
          codigo_qr           AS qrCode,
          estado_reserva      AS reservationStatus,
          estado_liquidacion  AS liquidationStatus,
          id_historico_precio AS priceHistoryId
       FROM ${TABLE}
       WHERE id = :id`,
      { id: Number(id) }
    );

    const list = rows as IReservation[];
    return list.length ? list[0] : undefined;
  },

  /** Create */
  async create(reservation: IReservation, exec: any = db): Promise<IReservation | undefined> {
    const [res] = await exec.execute(
      `INSERT INTO ${TABLE}
        (
          id_usuario,
          id_liquidacion,
          fecha_reservada,
          fecha_cancelacion,
          id_comida_entrada,
          id_comida_principal,
          id_comida_postre,
          id_comida_bebida,
          codigo_qr,
          estado_reserva,
          estado_liquidacion,
          id_historico_precio
        )
       VALUES
        (
          :userId,
          :liquidationId,
          :reservedAt,
          :cancelledAt,
          :starterFoodId,
          :mainFoodId,
          :dessertFoodId,
          :drinkFoodId,
          :qrCode,
          :reservationStatus,
          :liquidationStatus,
          :priceHistoryId
        )`,
      {
        userId: reservation.userId,
        liquidationId: reservation.liquidationId ?? null,
        reservedAt: reservation.reservedAt,
        cancelledAt: reservation.cancelledAt ?? null,
        starterFoodId: reservation.starterFoodId ?? null,
        mainFoodId: reservation.mainFoodId ?? null,
        dessertFoodId: reservation.dessertFoodId ?? null,
        drinkFoodId: reservation.drinkFoodId ?? null,
        qrCode: reservation.qrCode ?? null,
        reservationStatus: reservation.reservationStatus ?? "confirmada",
        liquidationStatus: reservation.liquidationStatus ?? 0,
        priceHistoryId: reservation.priceHistoryId ?? null,
      }
    );

    const insertId = (res as ResultSetHeader).insertId;
    return this.findById(insertId, exec);
  },

  /** Partial update (PATCH) */
  async updatePartial(
    id: number | string,
    patch: Partial<IReservation>,
    exec: any = db
  ): Promise<IReservation | undefined> {
    const allowed: (keyof IReservation)[] = [
      "userId",
      "liquidationId",
      "reservedAt",
      "cancelledAt",
      "starterFoodId",
      "mainFoodId",
      "dessertFoodId",
      "drinkFoodId",
      "qrCode",
      "reservationStatus",
      "liquidationStatus",
      "priceHistoryId",
    ];

    const entries = Object.entries(patch).filter(
      ([key, value]) => allowed.includes(key as keyof IReservation) && value !== undefined
    );

    if (!entries.length) {
      return this.findById(id, exec);
    }

    const columnMap: Record<string, string> = {
      userId: "id_usuario",
      liquidationId: "id_liquidacion",
      reservedAt: "fecha_reservada",
      cancelledAt: "fecha_cancelacion",
      starterFoodId: "id_comida_entrada",
      mainFoodId: "id_comida_principal",
      dessertFoodId: "id_comida_postre",
      drinkFoodId: "id_comida_bebida",
      qrCode: "codigo_qr",
      reservationStatus: "estado_reserva",
      liquidationStatus: "estado_liquidacion",
      priceHistoryId: "id_historico_precio",
    };

    const setSql = entries.map(([key]) => `${columnMap[key]} = :${key}`).join(", ");

    const params = Object.fromEntries(entries) as any;
    params.id = Number(id);

    await exec.execute(
      `UPDATE ${TABLE}
       SET ${setSql}
       WHERE id = :id`,
      params
    );

    return this.findById(id, exec);
  },

  /** Hard delete */
  async hardDelete(id: number | string, exec: any = db): Promise<boolean> {
    const [res] = await exec.execute(
      `DELETE FROM ${TABLE}
       WHERE id = :id`,
      { id: Number(id) }
    );

    return (res as ResultSetHeader).affectedRows > 0;
  },
};

export default ReservationModel;

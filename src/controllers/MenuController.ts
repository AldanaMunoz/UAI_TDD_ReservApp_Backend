import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import db from "../db/db";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function currentUser(req: Request) {
  return (req as any).user as { id: number; roles: string[] };
}

function canAccessUser(req: Request, userId: number) {
  const user = currentUser(req);
  return user?.id === userId || user?.roles?.includes("Administrador");
}

function parseOptionalFoodId(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : NaN;
}

const menuSelect = `SELECT
  ps.id AS planificacion_id,
  DATE_FORMAT(ps.fecha, '%Y-%m-%d') AS fecha,
  cps.id AS menu_id,
  cps.id_comida_entrada AS entrada_id,
  entrada.nombre AS entrada_nombre,
  entrada.url_imagen AS entrada_imagen,
  cps.id_comida_principal AS principal_id,
  principal.nombre AS principal_nombre,
  principal.url_imagen AS principal_imagen,
  cps.id_comida_alternativo AS alternativo_id,
  alternativo.nombre AS alternativo_nombre,
  alternativo.url_imagen AS alternativo_imagen,
  cps.id_comida_vegetariana AS vegetariana_id,
  vegetariana.nombre AS vegetariana_nombre,
  vegetariana.url_imagen AS vegetariana_imagen,
  cps.id_comida_postre AS postre_id,
  postre.nombre AS postre_nombre,
  postre.url_imagen AS postre_imagen,
  cps.id_comida_bebida AS bebida_id,
  bebida.nombre AS bebida_nombre,
  bebida.url_imagen AS bebida_imagen
 FROM planificaciones_semanales ps
 INNER JOIN comidas_planificacion_semanal cps ON cps.id = (
   SELECT MAX(latest.id) FROM comidas_planificacion_semanal latest
   WHERE latest.id_planificacion_semanal = ps.id
 )
 LEFT JOIN comidas entrada ON entrada.id = cps.id_comida_entrada
 LEFT JOIN comidas principal ON principal.id = cps.id_comida_principal
 LEFT JOIN comidas alternativo ON alternativo.id = cps.id_comida_alternativo
 LEFT JOIN comidas vegetariana ON vegetariana.id = cps.id_comida_vegetariana
 LEFT JOIN comidas postre ON postre.id = cps.id_comida_postre
 LEFT JOIN comidas bebida ON bebida.id = cps.id_comida_bebida`;

const reservationSelect = `SELECT
  r.id,
  r.fecha_reservada,
  r.id_comida_entrada,
  r.id_comida_principal,
  r.id_comida_postre,
  r.id_comida_bebida,
  r.estado_reserva,
  r.codigo_qr,
  entrada.nombre AS entrada_nombre,
  principal.nombre AS principal_nombre,
  postre.nombre AS postre_nombre,
  bebida.nombre AS bebida_nombre
 FROM reservas r
 LEFT JOIN comidas entrada ON entrada.id = r.id_comida_entrada
 LEFT JOIN comidas principal ON principal.id = r.id_comida_principal
 LEFT JOIN comidas postre ON postre.id = r.id_comida_postre
 LEFT JOIN comidas bebida ON bebida.id = r.id_comida_bebida`;

export async function getMenuByDate(req: Request, res: Response) {
  const fecha = req.params.fecha;
  if (!DATE_PATTERN.test(fecha)) return res.status(400).json({ message: "Fecha invalida" });
  try {
    const [rows] = await db.execute(`${menuSelect} WHERE ps.fecha = :fecha ORDER BY ps.id DESC LIMIT 1`, { fecha });
    const menu = (rows as any[])[0];
    if (!menu) return res.status(404).json({ message: "No hay menu planificado para esta fecha" });
    return res.status(200).json({ fecha, menu });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el menu", error });
  }
}

export async function getMyReservation(req: Request, res: Response) {
  const fecha = req.params.fecha;
  const userId = Number(req.query.userId);
  if (!DATE_PATTERN.test(fecha) || !Number.isInteger(userId) || !canAccessUser(req, userId)) {
    return res.status(403).json({ message: "No puedes consultar esta reserva" });
  }
  try {
    const [rows] = await db.execute(
      `${reservationSelect} WHERE r.id_usuario = :userId AND DATE(r.fecha_reservada) = :fecha
       AND r.estado_reserva <> 'cancelada' ORDER BY r.id DESC LIMIT 1`,
      { userId, fecha }
    );
    const reserva = (rows as any[])[0];
    return res.status(200).json(reserva ? { hasReservation: true, reserva } : { hasReservation: false });
  } catch (error) {
    return res.status(500).json({ message: "Error al consultar la reserva", error });
  }
}

export async function createReservation(req: Request, res: Response) {
  const userId = Number(req.body.userId);
  const fecha = String(req.body.fecha_reservada || "");
  const mainFoodId = Number(req.body.id_comida_principal);
  if (!canAccessUser(req, userId)) return res.status(403).json({ message: "No puedes crear reservas para otro usuario" });
  if (!DATE_PATTERN.test(fecha) || !Number.isInteger(mainFoodId)) {
    return res.status(400).json({ message: "Fecha y plato principal son obligatorios" });
  }

  try {
    const [menuRows] = await db.execute(`${menuSelect} WHERE ps.fecha = :fecha ORDER BY ps.id DESC LIMIT 1`, { fecha });
    const menu = (menuRows as any[])[0];
    if (!menu) return res.status(404).json({ message: "No hay menu para la fecha seleccionada" });
    if (![menu.principal_id, menu.alternativo_id, menu.vegetariana_id].includes(mainFoodId)) {
      return res.status(400).json({ message: "El plato principal no pertenece al menu del dia" });
    }
    const starterId = parseOptionalFoodId(req.body.id_comida_entrada);
    const dessertId = parseOptionalFoodId(req.body.id_comida_postre);
    const drinkId = parseOptionalFoodId(req.body.id_comida_bebida);
    if ([starterId, dessertId, drinkId].some(Number.isNaN)) {
      return res.status(400).json({ message: "Las comidas seleccionadas deben ser validas" });
    }
    if (starterId && starterId !== menu.entrada_id) {
      return res.status(400).json({ message: "La entrada no pertenece al menu del dia" });
    }
    if (dessertId && dessertId !== menu.postre_id) {
      return res.status(400).json({ message: "El postre no pertenece al menu del dia" });
    }
    if (drinkId && drinkId !== menu.bebida_id) {
      return res.status(400).json({ message: "La bebida no pertenece al menu del dia" });
    }

    const [existing] = await db.execute(
      `SELECT id FROM reservas WHERE id_usuario = :userId AND DATE(fecha_reservada) = :fecha
       AND estado_reserva <> 'cancelada' LIMIT 1`,
      { userId, fecha }
    );
    if ((existing as any[]).length) return res.status(409).json({ message: "Ya existe una reserva para esta fecha" });

    const [result] = await db.execute(
      `INSERT INTO reservas
        (id_usuario, fecha_reservada, id_comida_entrada, id_comida_principal, id_comida_postre,
         id_comida_bebida, codigo_qr, estado_reserva, estado_liquidacion)
       VALUES (:userId, :fecha, :starterId, :mainFoodId, :dessertId, :drinkId, :qrCode, 'confirmada', 0)`,
      {
        userId,
        fecha: `${fecha} 00:00:00`,
        starterId,
        mainFoodId,
        dessertId,
        drinkId,
        qrCode: `QR-${userId}-${fecha}-${randomUUID()}`,
      }
    );
    return res.status(201).json({ message: "Reserva creada correctamente", reservaId: (result as any).insertId });
  } catch (error: any) {
    const status = error?.code === "ER_DUP_ENTRY" ? 409 : 500;
    return res.status(status).json({ message: "Error al crear la reserva", error: error?.message || error });
  }
}

export async function cancelReservation(req: Request, res: Response) {
  const reservationId = Number(req.params.id);
  const userId = Number(req.body.userId);
  if (!canAccessUser(req, userId)) return res.status(403).json({ message: "No puedes cancelar esta reserva" });
  try {
    const [result] = await db.execute(
      `UPDATE reservas SET estado_reserva = 'cancelada', fecha_cancelacion = NOW()
       WHERE id = :reservationId AND id_usuario = :userId AND estado_reserva = 'confirmada'`,
      { reservationId, userId }
    );
    if (!(result as any).affectedRows) return res.status(404).json({ message: "Reserva activa no encontrada" });
    return res.status(200).json({ message: "Reserva cancelada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al cancelar la reserva", error });
  }
}

export async function getReservationsByUser(req: Request, res: Response) {
  const userId = Number(req.params.userId);
  if (!canAccessUser(req, userId)) return res.status(403).json({ message: "No puedes consultar estas reservas" });
  try {
    const [rows] = await db.execute(
      `${reservationSelect} WHERE r.id_usuario = :userId ORDER BY r.fecha_reservada DESC, r.id DESC`,
      { userId }
    );
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el historial", error });
  }
}

export async function getReservationsByDay(req: Request, res: Response) {
  const fecha = req.params.fecha;
  if (!DATE_PATTERN.test(fecha)) return res.status(400).json({ message: "Fecha invalida" });
  try {
    const [rows] = await db.execute(
      `SELECT r.id, CONCAT(COALESCE(p.nombre, ''), ' ', COALESCE(p.apellido, '')) AS nombre_completo,
        e.tipo AS tipo_empleado, e.turno,
        entrada.nombre AS entrada, principal.nombre AS plato_principal,
        postre.nombre AS postre, bebida.nombre AS bebida,
        r.codigo_qr, r.estado_reserva, (r.estado_reserva = 'asistio') AS asistio
       FROM reservas r
       INNER JOIN usuarios u ON u.id = r.id_usuario
       LEFT JOIN personas p ON p.id_usuario = u.id
       LEFT JOIN empleados e ON e.id_persona = p.id
       LEFT JOIN comidas entrada ON entrada.id = r.id_comida_entrada
       LEFT JOIN comidas principal ON principal.id = r.id_comida_principal
       LEFT JOIN comidas postre ON postre.id = r.id_comida_postre
       LEFT JOIN comidas bebida ON bebida.id = r.id_comida_bebida
       WHERE DATE(r.fecha_reservada) = :fecha AND r.estado_reserva <> 'cancelada'
       ORDER BY e.turno, p.apellido, p.nombre`,
      { fecha }
    );
    return res.status(200).json({ fecha, reservas: rows });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener reservas del dia", error });
  }
}

export async function updateAttendance(req: Request, res: Response) {
  const id = Number(req.params.id);
  const status = req.body.asistio ? "asistio" : "confirmada";
  try {
    const [result] = await db.execute(
      `UPDATE reservas SET estado_reserva = :status WHERE id = :id AND estado_reserva IN ('confirmada', 'asistio')`,
      { id, status }
    );
    if (!(result as any).affectedRows) return res.status(404).json({ message: "Reserva no encontrada" });
    return res.status(200).json({ message: "Asistencia actualizada", estado_reserva: status });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar asistencia", error });
  }
}

export async function finishShift(req: Request, res: Response) {
  const { fecha, turno } = req.params;
  if (!DATE_PATTERN.test(fecha) || !["manana", "tarde", "noche"].includes(turno)) {
    return res.status(400).json({ message: "Fecha o turno invalido" });
  }
  try {
    const [result] = await db.execute(
      `UPDATE reservas r
       INNER JOIN usuarios u ON u.id = r.id_usuario
       INNER JOIN personas p ON p.id_usuario = u.id
       INNER JOIN empleados e ON e.id_persona = p.id
       SET r.estado_reserva = 'noshow'
       WHERE DATE(r.fecha_reservada) = :fecha AND e.turno = :turno AND r.estado_reserva = 'confirmada'`,
      { fecha, turno }
    );
    return res.status(200).json({ message: "Turno finalizado", reservasNoShow: (result as any).affectedRows });
  } catch (error) {
    return res.status(500).json({ message: "Error al finalizar el turno", error });
  }
}

export default {
  getMenuByDate,
  getMyReservation,
  createReservation,
  cancelReservation,
  getReservationsByUser,
  getReservationsByDay,
  updateAttendance,
  finishShift,
};

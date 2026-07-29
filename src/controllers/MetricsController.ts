import type { Request, Response } from "express";
import db from "../db/db";

const CAPACITY = Number(process.env.DAILY_CAPACITY || 800);
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function trafficLight(value: number) {
  return value >= 80 ? "verde" : value >= 60 ? "amarillo" : "rojo";
}

function percentage(part: number, total: number) {
  return total ? Number(((part * 100) / total).toFixed(2)) : 0;
}

async function season(id?: number) {
  const [rows] = await db.execute(
    `SELECT t.id, e.nombre, DATE_FORMAT(t.fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
      DATE_FORMAT(t.fecha_fin, '%Y-%m-%d') AS fecha_fin
     FROM temporadas t INNER JOIN estaciones e ON e.id = t.id_estacion
     WHERE (:id IS NULL OR t.id = :id)
     ORDER BY t.fecha_fin DESC, t.id DESC LIMIT 1`,
    { id: id || null }
  );
  return (rows as any[])[0] || { id: 0, nombre: "Sin temporada", fecha_inicio: "1970-01-01", fecha_fin: "2099-12-31" };
}

async function attendanceStats(where = "1=1", params: Record<string, unknown> = {}) {
  const [rows] = await db.execute(
    `SELECT
      SUM(estado_reserva = 'asistio') AS confirmadas,
      SUM(estado_reserva = 'noshow') AS no_show,
      SUM(estado_reserva = 'cancelada') AS canceladas,
      COUNT(*) AS total
     FROM reservas r
     LEFT JOIN usuarios u ON u.id = r.id_usuario
     LEFT JOIN personas p ON p.id_usuario = u.id
     LEFT JOIN empleados e ON e.id_persona = p.id
     WHERE ${where}`,
    params
  );
  const row = (rows as any[])[0] || {};
  const confirmadas = Number(row.confirmadas || 0);
  const noShow = Number(row.no_show || 0);
  const canceladas = Number(row.canceladas || 0);
  const total = Number(row.total || 0);
  const attendance = percentage(confirmadas, confirmadas + noShow);
  return { confirmadas, no_show: noShow, canceladas, total, porcentaje_asistencia: attendance, semaforo: trafficLight(attendance) };
}

function employeeTypeFilter(req: Request) {
  const type = String(req.query.tipo_empleado || "");
  return ["interno", "externo"].includes(type) ? type : null;
}

export async function getAttendance(req: Request, res: Response) {
  try {
    const stats = await attendanceStats();
    return res.json({ reservas_confirmadas: stats.confirmadas, no_show: stats.no_show, canceladas: stats.canceladas, porcentaje_asistencia: stats.porcentaje_asistencia, semaforo: stats.semaforo });
  } catch (error) { return res.status(500).json({ message: "Error al calcular asistencia", error }); }
}

export async function getAttendanceSeason(req: Request, res: Response) {
  try {
    const current = await season(Number(req.query.id_temporada) || undefined);
    const type = employeeTypeFilter(req);
    const params = { start: current.fecha_inicio, end: current.fecha_fin, type };
    const typeSql = type ? " AND e.tipo = :type" : "";
    const stats = await attendanceStats("DATE(r.fecha_reservada) BETWEEN :start AND :end" + typeSql, params);
    const [rows] = await db.execute(
      `SELECT MONTH(r.fecha_reservada) AS mes, YEAR(r.fecha_reservada) AS anio,
        SUM(r.estado_reserva = 'asistio') AS confirmadas,
        SUM(r.estado_reserva = 'noshow') AS no_show,
        SUM(r.estado_reserva = 'cancelada') AS canceladas, COUNT(*) AS total
       FROM reservas r LEFT JOIN usuarios u ON u.id=r.id_usuario LEFT JOIN personas p ON p.id_usuario=u.id
       LEFT JOIN empleados e ON e.id_persona=p.id
       WHERE DATE(r.fecha_reservada) BETWEEN :start AND :end${typeSql}
       GROUP BY YEAR(r.fecha_reservada), MONTH(r.fecha_reservada) ORDER BY anio, mes`,
      params
    );
    const meses = (rows as any[]).map(row => ({ ...row, nombre_mes: MONTHS[row.mes - 1], porcentaje: percentage(Number(row.confirmadas), Number(row.confirmadas) + Number(row.no_show)) }));
    return res.json({ temporada: current, estadisticas: stats, meses });
  } catch (error) { return res.status(500).json({ message: "Error al calcular asistencia de temporada", error }); }
}

export async function getAttendanceMonth(req: Request, res: Response) {
  const month = Number(req.query.mes); const year = Number(req.query.anio); const type = employeeTypeFilter(req);
  if (month < 1 || month > 12 || !Number.isInteger(year)) return res.status(400).json({ message: "Mes o anio invalido" });
  try {
    const params = { month, year, type }; const typeSql = type ? " AND e.tipo = :type" : "";
    const where = "MONTH(r.fecha_reservada)=:month AND YEAR(r.fecha_reservada)=:year" + typeSql;
    const stats = await attendanceStats(where, params);
    const [rows] = await db.execute(
      `SELECT DATE_FORMAT(r.fecha_reservada,'%Y-%m-%d') AS fecha, DAYNAME(r.fecha_reservada) AS dia_semana,
       SUM(r.estado_reserva='asistio') AS confirmadas, SUM(r.estado_reserva='noshow') AS no_show,
       SUM(r.estado_reserva='cancelada') AS canceladas, COUNT(*) AS total
       FROM reservas r LEFT JOIN usuarios u ON u.id=r.id_usuario LEFT JOIN personas p ON p.id_usuario=u.id
       LEFT JOIN empleados e ON e.id_persona=p.id WHERE ${where}
       GROUP BY DATE_FORMAT(r.fecha_reservada,'%Y-%m-%d'), DAYNAME(r.fecha_reservada) ORDER BY fecha`, params);
    const dias = (rows as any[]).map(row => ({ ...row, porcentaje: percentage(Number(row.confirmadas), Number(row.confirmadas) + Number(row.no_show)) }));
    return res.json({ mes: month, anio: year, nombre_mes: MONTHS[month - 1], estadisticas: stats, dias });
  } catch (error) { return res.status(500).json({ message: "Error al calcular asistencia mensual", error }); }
}

export async function getAttendanceDay(req: Request, res: Response) {
  const fecha = String(req.query.fecha || ""); const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
  try {
    const type = employeeTypeFilter(req); const states = String(req.query.estados || "").split(",").filter(Boolean);
    const params: any = { fecha, type };
    let extra = type ? " AND e.tipo=:type" : "";
    if (states.length) { extra += ` AND r.estado_reserva IN (${states.map((_, index) => `:state${index}`).join(",")})`; states.forEach((state, index) => params[`state${index}`] = state); }
    const stats = await attendanceStats("DATE(r.fecha_reservada)=:fecha" + extra, params);
    const [countRows] = await db.execute(`SELECT COUNT(*) total FROM reservas r LEFT JOIN usuarios u ON u.id=r.id_usuario LEFT JOIN personas p ON p.id_usuario=u.id LEFT JOIN empleados e ON e.id_persona=p.id WHERE DATE(r.fecha_reservada)=:fecha${extra}`, params);
    const total = Number((countRows as any[])[0]?.total || 0);
    const [rows] = await db.execute(
      `SELECT r.id, CONCAT(COALESCE(p.nombre,''),' ',COALESCE(p.apellido,'')) nombre_completo,
       COALESCE(e.tipo,'interno') tipo_empleado, r.estado_reserva, e.turno
       FROM reservas r LEFT JOIN usuarios u ON u.id=r.id_usuario LEFT JOIN personas p ON p.id_usuario=u.id
       LEFT JOIN empleados e ON e.id_persona=p.id WHERE DATE(r.fecha_reservada)=:fecha${extra}
       ORDER BY p.apellido,p.nombre LIMIT ${limit} OFFSET ${(page - 1) * limit}`, params);
    return res.json({ fecha, dia_semana: rows && (new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long" })), estadisticas: stats, reservas: rows, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } });
  } catch (error) { return res.status(500).json({ message: "Error al obtener asistencia diaria", error }); }
}

export async function exportAttendance(req: Request, res: Response) {
  try {
    const fecha = String(req.query.fecha || "");
    const [rows] = await db.execute(
      `SELECT r.id, DATE_FORMAT(r.fecha_reservada,'%Y-%m-%d') fecha, r.estado_reserva,
       CONCAT(COALESCE(p.nombre,''),' ',COALESCE(p.apellido,'')) empleado, e.tipo, e.turno
       FROM reservas r LEFT JOIN usuarios u ON u.id=r.id_usuario LEFT JOIN personas p ON p.id_usuario=u.id
       LEFT JOIN empleados e ON e.id_persona=p.id WHERE (:fecha='' OR DATE(r.fecha_reservada)=:fecha)
       ORDER BY r.fecha_reservada,r.id`, { fecha });
    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = ["id,fecha,estado,empleado,tipo,turno", ...(rows as any[]).map(row => [row.id,row.fecha,row.estado_reserva,row.empleado,row.tipo,row.turno].map(escape).join(","))].join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", "attachment; filename=asistencia.csv");
    return res.send("\ufeff" + csv);
  } catch (error) { return res.status(500).json({ message: "Error al exportar asistencia", error }); }
}

export async function getReservationsByDay(_req: Request, res: Response) {
  try {
    const [rows] = await db.execute(`SELECT WEEKDAY(fecha_reservada) dia_numero, DAYNAME(fecha_reservada) dia_nombre, COUNT(*) total_reservas FROM reservas WHERE estado_reserva <> 'cancelada' GROUP BY WEEKDAY(fecha_reservada),DAYNAME(fecha_reservada) ORDER BY dia_numero`);
    return res.json((rows as any[]).map(row => ({ ...row, porcentaje_ocupacion: percentage(Number(row.total_reservas), CAPACITY), semaforo: trafficLight(100 - percentage(Number(row.total_reservas), CAPACITY)) })));
  } catch (error) { return res.status(500).json({ message: "Error al calcular reservas por dia", error }); }
}

export async function getReservationsSeason(req: Request, res: Response) {
  try {
    const current = await season(Number(req.query.id_temporada) || undefined);
    const [rows] = await db.execute(
      `SELECT WEEKDAY(fecha_reservada) dia_numero, DAYNAME(fecha_reservada) dia_nombre,
       DAYNAME(fecha_reservada) dia_semana, COUNT(*) total_reservas,
       ROUND(COUNT(*)/COUNT(DISTINCT DATE(fecha_reservada)),2) promedio_reservas
       FROM reservas WHERE DATE(fecha_reservada) BETWEEN :start AND :end AND estado_reserva<>'cancelada'
       GROUP BY WEEKDAY(fecha_reservada),DAYNAME(fecha_reservada) ORDER BY dia_numero`, { start: current.fecha_inicio, end: current.fecha_fin });
    return res.json({ temporada: current, capacidad_maxima: CAPACITY, dias_semana: (rows as any[]).map(row => ({ ...row, porcentaje_ocupacion: percentage(Number(row.promedio_reservas), CAPACITY), semaforo: trafficLight(100 - percentage(Number(row.promedio_reservas), CAPACITY)) })) });
  } catch (error) { return res.status(500).json({ message: "Error al obtener reservas de temporada", error }); }
}

export async function getReservationsDayDetail(req: Request, res: Response) {
  try {
    const current = await season(Number(req.query.id_temporada) || undefined); const day = String(req.query.dia_semana || "Monday");
    const [rows] = await db.execute(
      `SELECT DATE_FORMAT(fecha_reservada,'%Y-%m-%d') fecha, COUNT(*) total_reservas
       FROM reservas WHERE DATE(fecha_reservada) BETWEEN :start AND :end AND DAYNAME(fecha_reservada)=:day
       AND estado_reserva<>'cancelada' GROUP BY DATE_FORMAT(fecha_reservada,'%Y-%m-%d') ORDER BY fecha`, { start: current.fecha_inicio, end: current.fecha_fin, day });
    return res.json({ temporada: current, dia_semana: day, dia_numero: 0, capacidad_maxima: CAPACITY, fechas: (rows as any[]).map(row => ({ ...row, porcentaje_ocupacion: percentage(Number(row.total_reservas), CAPACITY), semaforo: trafficLight(100 - percentage(Number(row.total_reservas), CAPACITY)) })) });
  } catch (error) { return res.status(500).json({ message: "Error al obtener detalle por dia", error }); }
}

export async function getReservationsDate(req: Request, res: Response) {
  const fecha = String(req.query.fecha || ""); const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
  try {
    const [count] = await db.execute(`SELECT COUNT(*) total FROM reservas WHERE DATE(fecha_reservada)=:fecha AND estado_reserva<>'cancelada'`, { fecha }); const total = Number((count as any[])[0]?.total || 0);
    const [rows] = await db.execute(
      `SELECT r.id, CONCAT(COALESCE(p.nombre,''),' ',COALESCE(p.apellido,'')) nombre_completo,
       COALESCE(e.tipo,'interno') tipo_empleado,e.turno, entrada.nombre entrada, principal.nombre plato_principal,
       postre.nombre postre,bebida.nombre bebida FROM reservas r LEFT JOIN usuarios u ON u.id=r.id_usuario
       LEFT JOIN personas p ON p.id_usuario=u.id LEFT JOIN empleados e ON e.id_persona=p.id
       LEFT JOIN comidas entrada ON entrada.id=r.id_comida_entrada LEFT JOIN comidas principal ON principal.id=r.id_comida_principal
       LEFT JOIN comidas postre ON postre.id=r.id_comida_postre LEFT JOIN comidas bebida ON bebida.id=r.id_comida_bebida
       WHERE DATE(r.fecha_reservada)=:fecha AND r.estado_reserva<>'cancelada' ORDER BY p.apellido,p.nombre LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
      { fecha });
    return res.json({ fecha, dia_semana: new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long" }), total_reservas: total, reservas: rows, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } });
  } catch (error) { return res.status(500).json({ message: "Error al obtener reservas de la fecha", error }); }
}

async function preferences() {
  const [rows] = await db.execute(
    `SELECT cr.nombre restriccion, COUNT(DISTINCT ur.id_usuario) cantidad_usuarios, COUNT(*) total_selecciones
     FROM usuario_restricciones ur INNER JOIN comidas_restricciones cr ON cr.id=ur.id_restriccion
     GROUP BY cr.id,cr.nombre ORDER BY cantidad_usuarios DESC`);
  const total = (rows as any[]).reduce((sum, row) => sum + Number(row.cantidad_usuarios), 0);
  return (rows as any[]).map(row => ({ ...row, porcentaje: percentage(Number(row.cantidad_usuarios), total) }));
}

export async function getPreferences(_req: Request, res: Response) {
  try { return res.json((await preferences()).map(({ restriccion, cantidad_usuarios, porcentaje }) => ({ restriccion, cantidad_usuarios, porcentaje }))); }
  catch (error) { return res.status(500).json({ message: "Error al calcular preferencias", error }); }
}

async function datesInRange(start: string, end: string) {
  const [rows] = await db.execute(`SELECT DISTINCT MONTH(fecha_reservada) mes,YEAR(fecha_reservada) anio FROM reservas WHERE DATE(fecha_reservada) BETWEEN :start AND :end ORDER BY anio,mes`, { start, end });
  return (rows as any[]).map(row => ({ ...row, nombre_mes: MONTHS[row.mes - 1] }));
}

export async function getPreferencesSeason(req: Request, res: Response) {
  try { const current = await season(Number(req.query.id_temporada) || undefined); return res.json({ temporada: current, preferencias: await preferences(), meses: (await datesInRange(current.fecha_inicio,current.fecha_fin)).map(month => ({ ...month, preferencias: [] })) }); }
  catch (error) { return res.status(500).json({ message: "Error al obtener preferencias", error }); }
}

export async function getPreferencesMonth(req: Request, res: Response) {
  const mes=Number(req.query.mes), anio=Number(req.query.anio);
  try { const [days]=await db.execute(`SELECT DISTINCT DATE_FORMAT(fecha_reservada,'%Y-%m-%d') fecha,DAYNAME(fecha_reservada) dia_semana FROM reservas WHERE MONTH(fecha_reservada)=:mes AND YEAR(fecha_reservada)=:anio ORDER BY fecha`,{mes,anio}); return res.json({ mes:{mes,anio,nombre_mes:MONTHS[mes-1]},preferencias:await preferences(),dias:(days as any[]).map(day=>({...day,preferencias:[]})) }); }
  catch(error){return res.status(500).json({message:"Error al obtener preferencias mensuales",error});}
}

async function foodRanking(fecha: string, column: string) {
  const [rows] = await db.execute(`SELECT c.nombre plato,COUNT(*) cantidad FROM reservas r INNER JOIN comidas c ON c.id=r.${column} WHERE DATE(r.fecha_reservada)=:fecha AND r.estado_reserva<>'cancelada' GROUP BY c.id,c.nombre ORDER BY cantidad DESC`,{fecha});
  const total=(rows as any[]).reduce((sum,row)=>sum+Number(row.cantidad),0); return (rows as any[]).map(row=>({...row,total_pedidos:total,porcentaje:percentage(Number(row.cantidad),total)}));
}

export async function getPreferencesDay(req: Request,res: Response){const fecha=String(req.query.fecha||"");try{const [[count],entrada,principal,postre,bebida]=await Promise.all([db.execute(`SELECT COUNT(*) total FROM reservas WHERE DATE(fecha_reservada)=:fecha AND estado_reserva<>'cancelada'`,{fecha}).then(([r])=>r as any[]),foodRanking(fecha,"id_comida_entrada"),foodRanking(fecha,"id_comida_principal"),foodRanking(fecha,"id_comida_postre"),foodRanking(fecha,"id_comida_bebida")]);return res.json({fecha,dia_semana:new Date(fecha+"T00:00:00").toLocaleDateString("es-AR",{weekday:"long"}),total_comidas:Number(count?.total||0),preferencias:await preferences(),ranking_entradas:entrada,ranking_principales:principal,ranking_postres:postre,ranking_bebidas:bebida});}catch(error){return res.status(500).json({message:"Error al obtener preferencias diarias",error});}}

async function consumption(where="1=1",params:Record<string,unknown>={}){const [rows]=await db.execute(`SELECT COALESCE(e.tipo,'interno') tipo_empleado,COUNT(*) total_reservas FROM reservas r LEFT JOIN usuarios u ON u.id=r.id_usuario LEFT JOIN personas p ON p.id_usuario=u.id LEFT JOIN empleados e ON e.id_persona=p.id WHERE ${where} AND r.estado_reserva<>'cancelada' GROUP BY e.tipo`,params);const total=(rows as any[]).reduce((sum,row)=>sum+Number(row.total_reservas),0);return (rows as any[]).map(row=>({...row,porcentaje:percentage(Number(row.total_reservas),total)}));}

export async function getConsumption(_req:Request,res:Response){try{return res.json((await consumption()).map(row=>({tipo:row.tipo_empleado,total_consumos:row.total_reservas,costo_estimado:0})));}catch(error){return res.status(500).json({message:"Error al calcular consumo",error});}}
export async function getConsumptionSeason(req:Request,res:Response){try{const current=await season(Number(req.query.id_temporada)||undefined);return res.json({temporada:current,consumo:await consumption("DATE(r.fecha_reservada) BETWEEN :start AND :end",{start:current.fecha_inicio,end:current.fecha_fin}),meses:await datesInRange(current.fecha_inicio,current.fecha_fin)});}catch(error){return res.status(500).json({message:"Error al obtener consumo",error});}}
export async function getConsumptionMonth(req:Request,res:Response){const mes=Number(req.query.mes),anio=Number(req.query.anio);try{const [days]=await db.execute(`SELECT DISTINCT DATE_FORMAT(fecha_reservada,'%Y-%m-%d') fecha,DAYNAME(fecha_reservada) dia_semana,DAYNAME(fecha_reservada) nombre_dia FROM reservas WHERE MONTH(fecha_reservada)=:mes AND YEAR(fecha_reservada)=:anio ORDER BY fecha`,{mes,anio});return res.json({mes:{mes,anio,nombre_mes:MONTHS[mes-1]},consumo:await consumption("MONTH(r.fecha_reservada)=:mes AND YEAR(r.fecha_reservada)=:anio",{mes,anio}),dias:days});}catch(error){return res.status(500).json({message:"Error al obtener consumo mensual",error});}}
export async function getConsumptionDay(req:Request,res:Response){const fecha=String(req.query.fecha||"");try{const [rows]=await db.execute(`SELECT CONCAT(COALESCE(p.nombre,''),' ',COALESCE(p.apellido,'')) nombre_usuario,COALESCE(e.tipo,'interno') tipo_empleado,entrada.nombre entrada,principal.nombre plato_principal,postre.nombre postre,bebida.nombre bebida,NULL restricciones FROM reservas r LEFT JOIN usuarios u ON u.id=r.id_usuario LEFT JOIN personas p ON p.id_usuario=u.id LEFT JOIN empleados e ON e.id_persona=p.id LEFT JOIN comidas entrada ON entrada.id=r.id_comida_entrada LEFT JOIN comidas principal ON principal.id=r.id_comida_principal LEFT JOIN comidas postre ON postre.id=r.id_comida_postre LEFT JOIN comidas bebida ON bebida.id=r.id_comida_bebida WHERE DATE(r.fecha_reservada)=:fecha AND r.estado_reserva<>'cancelada'`,{fecha});return res.json({fecha,dia_semana:new Date(fecha+"T00:00:00").toLocaleDateString("es-AR",{weekday:"long"}),consumo:await consumption("DATE(r.fecha_reservada)=:fecha",{fecha}),detalle_comidas:rows});}catch(error){return res.status(500).json({message:"Error al obtener consumo diario",error});}}

export async function getTopUsers(req:Request,res:Response){const limit=Math.min(100,Math.max(1,Number(req.query.limit)||10));try{const [rows]=await db.execute(`SELECT CONCAT(COALESCE(p.nombre,''),' ',COALESCE(p.apellido,'')) usuario,COUNT(*) total_reservas FROM reservas r LEFT JOIN usuarios u ON u.id=r.id_usuario LEFT JOIN personas p ON p.id_usuario=u.id WHERE r.estado_reserva<>'cancelada' GROUP BY r.id_usuario,p.nombre,p.apellido ORDER BY total_reservas DESC LIMIT ${limit}`);const max=Number((rows as any[])[0]?.total_reservas||0);return res.json((rows as any[]).map(row=>({...row,porcentaje_uso:percentage(Number(row.total_reservas),max),semaforo:trafficLight(percentage(Number(row.total_reservas),max))})));}catch(error){return res.status(500).json({message:"Error al obtener usuarios",error});}}

export async function getConsumptionUsers(req:Request,res:Response){const fecha=String(req.query.fecha||"");const mes=Number(req.query.mes)||null;const anio=Number(req.query.anio)||null;try{let where="r.estado_reserva<>'cancelada'",params:any={};if(fecha){where+=" AND DATE(r.fecha_reservada)=:fecha";params.fecha=fecha;}else if(mes&&anio){where+=" AND MONTH(r.fecha_reservada)=:mes AND YEAR(r.fecha_reservada)=:anio";params={mes,anio};}const [rows]=await db.execute(`SELECT u.id,CONCAT(COALESCE(p.nombre,''),' ',COALESCE(p.apellido,'')) nombre_completo,COALESCE(e.tipo,'interno') tipo_empleado,COUNT(*) total_reservas FROM reservas r INNER JOIN usuarios u ON u.id=r.id_usuario LEFT JOIN personas p ON p.id_usuario=u.id LEFT JOIN empleados e ON e.id_persona=p.id WHERE ${where} GROUP BY u.id,p.nombre,p.apellido,e.tipo ORDER BY total_reservas DESC`,params);const max=Number((rows as any[])[0]?.total_reservas||0);return res.json({filtro:{mes,anio,fecha:fecha||null,fecha_inicio:fecha||"",fecha_fin:fecha||"",dias_disponibles:0},usuarios:(rows as any[]).map(row=>({...row,porcentaje_consumo:percentage(Number(row.total_reservas),max)}))});}catch(error){return res.status(500).json({message:"Error al obtener consumo por usuario",error});}}

export default {getAttendance,getAttendanceSeason,getAttendanceMonth,getAttendanceDay,exportAttendance,getReservationsByDay,getReservationsSeason,getReservationsDayDetail,getReservationsDate,getPreferences,getPreferencesSeason,getPreferencesMonth,getPreferencesDay,getConsumption,getConsumptionSeason,getConsumptionMonth,getConsumptionDay,getTopUsers,getConsumptionUsers};

export interface IWeeklyPlanning {
  id?: number;
  seasonId: number;     // id_temporada
  weekNumber: number;   // nro_semana
  weekDay: number;      // dia_semana
  date: string;         // fecha (YYYY-MM-DD)
}

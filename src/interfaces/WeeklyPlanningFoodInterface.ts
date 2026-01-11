export interface IWeeklyPlanningFood {
  id?: number;
  weeklyPlanningId: number;      // id_planificacion_semanal (UNIQUE)
  entryFoodId?: number | null;   // id_comida_entrada
  mainFoodId?: number | null;    // id_comida_principal
  altFoodId?: number | null;     // id_comida_alternativo
  vegFoodId?: number | null;     // id_comida_vegetariana
}

export interface IWeeklyPlanningFoodView extends IWeeklyPlanningFood {
  entryFoodName?: string | null;
  mainFoodName?: string | null;
  altFoodName?: string | null;
  vegFoodName?: string | null;
}

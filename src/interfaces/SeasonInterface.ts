export interface ISeason {
    id?: number;
    stationId: number; // DB: id_estacion
    name?: string; // Nombre de la estacion para respuestas
    year: number; // DB: anio
    startDate: string; // DB: fecha_inicio (YYYY-MM-DD)
    endDate: string; // DB: fecha_fin (YYYY-MM-DD)
}

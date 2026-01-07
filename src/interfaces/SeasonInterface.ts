export interface ISeason {
    id?: number;
    name: string;       // DB: nombre
    year: number;       // DB: anio
    startDate: string;  // DB: fecha_inicio (YYYY-MM-DD)
    endDate: string;    // DB: fecha_fin (YYYY-MM-DD)
}

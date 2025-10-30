export interface IPerson {
    id?: number;
    id_usuario?: number | null;
    nombre: string;
    apellido: string;
    activo?: 0 | 1 | boolean;
    created_at?: Date;
    updated_at?: Date;
}

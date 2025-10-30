export interface IEmployee {
    id?: number;
    id_persona: number; // FK a personas.id
    turno: "manana" | "tarde" | "noche";
    tipo: "interno" | "externo";
    created_at?: Date;
    updated_at?: Date;
}

export interface IFood {
    id?: number;
    foodTypeId: number;   // id_comida_tipo
    name: string;         // nombre
    isSpecial?: boolean; // es_especial
    imageUrl?: string | null; // url_imagen
    isActive?: boolean;  // activa
}
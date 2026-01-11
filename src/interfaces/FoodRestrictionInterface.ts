export interface IFoodRestriction {
  id?: number;
  name: string; // nombre
  description?: string | null; // descripcion
}

export interface IComboOption {
  value: number;
  label: string;
}

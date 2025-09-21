export interface IUser {
  id?: number;
  email: string;
  password: string;
  activo: number;        // 1 activo, 0 inactivo
  firebaseUID?: string;  // único, puede ser null
}
export interface IUserRole {
  id?: number;
  userId: number; // id_usuario
  roleId: number; // id_rol
}

export interface IUserRoleView extends IUserRole {
  email?: string;
  roleName?: string;
}

export interface IRolePermission {
  id?: number;
  roleId: number; // id_rol
  permissionId: number; // id_permiso
}

export interface IRolePermissionView extends IRolePermission {
  roleName?: string;
  permissionName?: string;
  endpointPath?: string;
}

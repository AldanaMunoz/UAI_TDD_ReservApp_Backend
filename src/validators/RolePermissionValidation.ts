import Joi from "joi";

export const createRolePermissionValidationSchema = Joi.object({
  roleId: Joi.number().integer().positive().required(),
  permissionId: Joi.number().integer().positive().required(),
}).options({ abortEarly: false, stripUnknown: true, convert: true });

export const updateRolePermissionValidationSchema = Joi.object({
  roleId: Joi.number().integer().positive().optional(),
  permissionId: Joi.number().integer().positive().optional(),
})
  .min(1)
  .messages({ "object.min": "You must send at least one field to update" })
  .options({ abortEarly: false, stripUnknown: true, convert: true });

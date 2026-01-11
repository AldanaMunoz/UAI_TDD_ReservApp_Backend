import Joi from "joi";

export const createUserRoleValidationSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  roleId: Joi.number().integer().positive().required(),
}).options({ abortEarly: false, stripUnknown: true, convert: true });

export const updateUserRoleValidationSchema = Joi.object({
  userId: Joi.number().integer().positive().optional(),
  roleId: Joi.number().integer().positive().optional(),
})
  .min(1)
  .messages({ "object.min": "Debes enviar al menos un campo para actualizar" })
  .options({ abortEarly: false, stripUnknown: true, convert: true });

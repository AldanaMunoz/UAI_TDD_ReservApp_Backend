import Joi from "joi";

export const createRoleValidationSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
}).options({ abortEarly: false, stripUnknown: true, convert: true });

export const updateRoleValidationSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
})
  .min(1)
  .messages({ "object.min": "Debes enviar al menos un campo para actualizar" })
  .options({ abortEarly: false, stripUnknown: true, convert: true });

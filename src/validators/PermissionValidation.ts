import Joi from "joi";

export const createPermissionValidationSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  endpointPath: Joi.string().min(1).max(255).required(),
}).options({ abortEarly: false, stripUnknown: true, convert: true });

export const updatePermissionValidationSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  endpointPath: Joi.string().min(1).max(255).optional(),
})
  .min(1)
  .messages({ "object.min": "Debe enviar al menos un campo para actualizar" })
  .options({ abortEarly: false, stripUnknown: true, convert: true });

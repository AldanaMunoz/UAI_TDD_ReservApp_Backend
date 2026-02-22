import Joi from "joi";

export const createPriceHistoryValidationSchema = Joi.object({
  price: Joi.number().precision(2).positive().required(),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  toDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null).optional(),
}).options({ abortEarly: false, stripUnknown: true, convert: true });

export const updatePriceHistoryValidationSchema = Joi.object({
  price: Joi.number().precision(2).positive().optional(),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null).optional(),
})
  .min(1)
  .messages({ "object.min": "Debes enviar al menos un campo para actualizar" })
  .options({ abortEarly: false, stripUnknown: true, convert: true });

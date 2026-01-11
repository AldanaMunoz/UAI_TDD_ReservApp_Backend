import Joi from "joi";

const nullableId = Joi.number().integer().positive().allow(null);

export const createWeeklyPlanningFoodValidationSchema = Joi.object({
  weeklyPlanningId: Joi.number().integer().positive().required(),
  entryFoodId: nullableId.optional(),
  mainFoodId: nullableId.optional(),
  altFoodId: nullableId.optional(),
  vegFoodId: nullableId.optional(),
}).options({ abortEarly: false, stripUnknown: true, convert: true });

export const updateWeeklyPlanningFoodValidationSchema = Joi.object({
  weeklyPlanningId: Joi.number().integer().positive().optional(),
  entryFoodId: nullableId.optional(),
  mainFoodId: nullableId.optional(),
  altFoodId: nullableId.optional(),
  vegFoodId: nullableId.optional(),
})
  .min(1)
  .messages({ "object.min": "Debes enviar al menos un campo para actualizar" })
  .options({ abortEarly: false, stripUnknown: true, convert: true });

import Joi from "joi";

export const createWeeklyPlanningValidationSchema = Joi.object({
  seasonId: Joi.number().integer().positive().required(),
  weekNumber: Joi.number().integer().positive().required(),
  weekDay: Joi.number().integer().min(1).max(7).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
}).options({ abortEarly: false, stripUnknown: true, convert: true });

export const updateWeeklyPlanningValidationSchema = Joi.object({
  seasonId: Joi.number().integer().positive().optional(),
  weekNumber: Joi.number().integer().positive().optional(),
  weekDay: Joi.number().integer().min(1).max(7).optional(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
  .min(1)
  .messages({ "object.min": "You must send at least one field to update" })
  .options({ abortEarly: false, stripUnknown: true, convert: true });

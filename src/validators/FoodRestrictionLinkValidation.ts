// src/validators/FoodRestrictionLinkValidation.ts
import Joi from "joi";

/** POST /food-restriction-links */
export const createFoodRestrictionLinkValidationSchema = Joi.object({
  foodId: Joi.number().integer().positive().required(),
  restrictionId: Joi.number().integer().positive().required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
  convert: true,
});

/** PATCH /food-restriction-links/:id */
export const updateFoodRestrictionLinkValidationSchema = Joi.object({
  foodId: Joi.number().integer().positive().optional(),
  restrictionId: Joi.number().integer().positive().optional(),
})
  .min(1)
  .messages({
    "object.min": "Debes enviar al menos un campo para actualizar",
  })
  .options({
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

// src/validators/FoodRestrictionValidation.ts
import Joi from "joi";

/** POST /food-restrictions */
export const createFoodRestrictionValidationSchema = Joi.object({
  name: Joi.string().min(1).max(120).required(),
  description: Joi.string().allow(null, "").optional(),
}).options({
  abortEarly: false,
  stripUnknown: true,
  convert: true,
});

/** PATCH /food-restrictions/:id */
export const updateFoodRestrictionValidationSchema = Joi.object({
  name: Joi.string().min(1).max(120).optional(),
  description: Joi.string().allow(null, "").optional(),
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

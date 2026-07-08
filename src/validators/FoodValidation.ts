// src/validators/FoodValidation.ts
import Joi from "joi";

const imageUrlSchema = Joi.alternatives().try(
  Joi.string().uri(),
  Joi.string().pattern(/^\/uploads\/foods\/\d+\/[A-Za-z0-9._-]+\.jpg$/),
  Joi.valid(null, "")
);

/** POST /foods */
export const createFoodValidationSchema = Joi.object({
  foodTypeId: Joi.number().integer().positive().required(),
  name: Joi.string().min(1).max(150).required(),
  isSpecial: Joi.boolean().optional(),
  imageUrl: imageUrlSchema.optional(),
  isActive: Joi.boolean().optional(),
}).options({
  abortEarly: false,
  stripUnknown: true,
  convert: true,
});

/** PATCH /foods/:id */
export const updateFoodValidationSchema = Joi.object({
  foodTypeId: Joi.number().integer().positive().optional(),
  name: Joi.string().min(1).max(150).optional(),
  isSpecial: Joi.boolean().optional(),
  imageUrl: imageUrlSchema.optional(),
  isActive: Joi.boolean().optional(),
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

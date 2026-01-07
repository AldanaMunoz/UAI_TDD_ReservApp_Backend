// src/validators/FoodValidation.ts
import Joi from "joi";

/** POST /foods */
export const createFoodValidationSchema = Joi.object({
    foodTypeId: Joi.number().integer().positive().required(),
    name: Joi.string().min(1).max(150).required(),
    isSpecial: Joi.boolean().optional(),
    imageUrl: Joi.string().allow(null, "").uri().optional(),
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
    imageUrl: Joi.string().allow(null, "").uri().optional(),
    isActive: Joi.boolean().optional(),
})
    .min(1)
    .messages({
        "object.min": "You must send at least one field to update",
    })
    .options({
        abortEarly: false,
        stripUnknown: true,
        convert: true,
    });

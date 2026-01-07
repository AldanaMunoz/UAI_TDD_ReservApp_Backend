// src/validators/FoodTypeValidation.ts
import Joi from "joi";

/** POST /food-types */
export const createFoodTypeValidationSchema = Joi.object({
    name: Joi.string().min(1).max(150).required().messages({
        "any.required": `"name" is required`,
        "string.empty": `"name" cannot be empty`,
    }),
    description: Joi.string().allow(null, "").max(255).optional(),
}).options({
    abortEarly: false,
    stripUnknown: true,
    convert: true,
});

/** PATCH /food-types/:id */
export const updateFoodTypeValidationSchema = Joi.object({
    name: Joi.string().min(1).max(150).optional(),
    description: Joi.string().allow(null, "").max(255).optional(),
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

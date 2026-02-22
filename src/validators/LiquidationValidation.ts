// src/validators/LiquidationValidation.ts
import Joi from "joi";

/** POST /liquidations */
export const createLiquidationValidationSchema = Joi.object({
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2000).max(3000).required(),
    totalAmount: Joi.number().min(0).optional(),
}).options({
    abortEarly: false,
    stripUnknown: true,
    convert: true,
});

/** POST /liquidations/generate (month/year) */
export const generateLiquidationValidationSchema = Joi.object({
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2000).max(3000).required(),
}).options({
    abortEarly: false,
    stripUnknown: true,
    convert: true,
});

/** PATCH /liquidations/:id */
export const updateLiquidationValidationSchema = Joi.object({
    month: Joi.number().integer().min(1).max(12).optional(),
    year: Joi.number().integer().min(2000).max(3000).optional(),
    totalAmount: Joi.number().min(0).optional(),
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

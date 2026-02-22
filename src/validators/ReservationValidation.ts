// src/validators/ReservationValidation.ts
import Joi from "joi";

// Helpers
const positiveIntOrNull = Joi.number().integer().positive().allow(null);
const isoDateOrNull = Joi.date().iso().allow(null);

/** POST /reservations */
export const createReservationValidationSchema = Joi.object({
    employeeId: Joi.number().integer().positive().required(),
    liquidationId: positiveIntOrNull.optional(),

    reservedAt: Joi.date().iso().required(),
    cancelledAt: isoDateOrNull.optional(),

    starterFoodId: positiveIntOrNull.optional(),
    mainFoodId: positiveIntOrNull.optional(),
    dessertFoodId: positiveIntOrNull.optional(),
    drinkFoodId: positiveIntOrNull.optional(),

    qrCode: Joi.string().max(255).allow(null, "").optional(),

    reservationStatus: Joi.number().integer().min(0).optional(),
    liquidationStatus: Joi.number().integer().min(0).optional(),
}).options({
    abortEarly: false,
    stripUnknown: true,
    convert: true,
});

/** PATCH /reservations/:id */
export const updateReservationValidationSchema = Joi.object({
    employeeId: Joi.number().integer().positive().optional(),
    liquidationId: positiveIntOrNull.optional(),

    reservedAt: Joi.date().iso().optional(),
    cancelledAt: isoDateOrNull.optional(),

    starterFoodId: positiveIntOrNull.optional(),
    mainFoodId: positiveIntOrNull.optional(),
    dessertFoodId: positiveIntOrNull.optional(),
    drinkFoodId: positiveIntOrNull.optional(),

    qrCode: Joi.string().max(255).allow(null, "").optional(),

    reservationStatus: Joi.number().integer().min(0).optional(),
    liquidationStatus: Joi.number().integer().min(0).optional(),
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

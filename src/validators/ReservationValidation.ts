import Joi from "joi";

// Helpers
const positiveIntOrNull = Joi.number().integer().positive().allow(null);
const isoDateOrNull = Joi.date().iso().allow(null);

const reservationStatusSchema = Joi.string().valid(
  "confirmada",
  "cancelada",
  "asistio",
  "noshow",
  "liquidada"
);

const liquidationStatusSchema = Joi.number().integer().valid(0, 1);

/** POST /reservations */
export const createReservationValidationSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  liquidationId: positiveIntOrNull.optional(),
  priceHistoryId: Joi.number().integer().positive().allow(null).optional(),

  reservedAt: Joi.date().iso().required(),
  cancelledAt: isoDateOrNull.optional(),

  starterFoodId: positiveIntOrNull.optional(),
  mainFoodId: positiveIntOrNull.optional(),
  dessertFoodId: positiveIntOrNull.optional(),
  drinkFoodId: positiveIntOrNull.optional(),
  qrCode: Joi.string().trim().max(255).allow(null, "").optional(),

  reservationStatus: reservationStatusSchema.optional(),
  liquidationStatus: liquidationStatusSchema.optional(),
}).options({
  abortEarly: false,
  stripUnknown: true,
  convert: true,
});

/** PATCH /reservations/:id */
export const updateReservationValidationSchema = Joi.object({
  userId: Joi.number().integer().positive().optional(),
  liquidationId: positiveIntOrNull.optional(),
  priceHistoryId: Joi.number().integer().positive().allow(null).optional(),

  reservedAt: Joi.date().iso().optional(),
  cancelledAt: isoDateOrNull.optional(),

  starterFoodId: positiveIntOrNull.optional(),
  mainFoodId: positiveIntOrNull.optional(),
  dessertFoodId: positiveIntOrNull.optional(),
  drinkFoodId: positiveIntOrNull.optional(),
  qrCode: Joi.string().trim().max(255).allow(null, "").optional(),

  reservationStatus: reservationStatusSchema.optional(),
  liquidationStatus: liquidationStatusSchema.optional(),
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

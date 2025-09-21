// src/validation/user.schemas.ts
import Joi from "joi";

/** Alta de usuario (POST /users) */
export const createUserValidationSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    "string.base": `"email" debe ser texto`,
    "string.email": `"email" no es válido`,
    "any.required": `"email" es requerido`,
  }),
  password: Joi.string().min(6).max(64).required().messages({
    "string.base": `"password" debe ser texto`,
    "string.min": `"password" debe tener al menos 6 caracteres`,
    "string.max": `"password" debe tener como máximo 64 caracteres`,
    "any.required": `"password" es requerido`,
  }),
  // 1 activo, 0 inactivo. Convertimos strings numéricos a number (p.ej "1" -> 1)
  activo: Joi.number().valid(0, 1).default(1).messages({
    "number.base": `"activo" debe ser número`,
    "any.only": `"activo" debe ser 0 o 1`,
  }),
  firebaseUID: Joi.string().trim().max(128).allow(null, "").optional().messages({
    "string.base": `"firebaseUID" debe ser texto`,
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,  // elimina campos no definidos en el schema
  convert: true,       // convierte "1" -> 1, etc.
});

/** Login (POST /auth/login) */
export const loginValidationSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    "any.required": `"email" es requerido`,
  }),
  password: Joi.string().min(6).max(64).required().messages({
    "any.required": `"password" es requerido`,
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
  convert: true,
});

/** Update parcial (PATCH /users/:id) */
export const updateUserValidationSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).optional(),
  password: Joi.string().min(6).max(64).optional(),
  activo: Joi.number().valid(0, 1).optional(),
  firebaseUID: Joi.string().trim().max(128).allow(null, "").optional(),
})
  .min(1) // al menos un campo
  .messages({
    "object.min": "Debes enviar al menos un campo para actualizar",
  })
  .options({
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

/** Soft delete / toggle activo (PATCH /users/:id/activo) */
export const softDeleteValidationSchema = Joi.object({
  activo: Joi.number().valid(0, 1).required().messages({
    "any.required": `"activo" es requerido`,
    "any.only": `"activo" debe ser 0 o 1`,
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
  convert: true,
});

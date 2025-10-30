import Joi from "joi";

/** Alta de persona (POST /personas) */
export const createPersonValidationSchema = Joi.object({
    id_usuario: Joi.number().integer().allow(null).optional().messages({
        "number.base": `"id_usuario" debe ser un número o null`,
    }),
    nombre: Joi.string().trim().min(2).max(120).required().messages({
        "string.base": `"nombre" debe ser texto`,
        "string.empty": `"nombre" no puede estar vacío`,
        "string.min": `"nombre" debe tener al menos 2 caracteres`,
        "string.max": `"nombre" debe tener como máximo 120 caracteres`,
        "any.required": `"nombre" es requerido`,
    }),
    apellido: Joi.string().trim().min(2).max(120).required().messages({
        "string.base": `"apellido" debe ser texto`,
        "string.empty": `"apellido" no puede estar vacío`,
        "string.min": `"apellido" debe tener al menos 2 caracteres`,
        "string.max": `"apellido" debe tener como máximo 120 caracteres`,
        "any.required": `"apellido" es requerido`,
    }),
    activo: Joi.number().valid(0, 1).default(1).messages({
        "number.base": `"activo" debe ser número`,
        "any.only": `"activo" debe ser 0 o 1`,
    }),
}).options({
    abortEarly: false,
    stripUnknown: true, // elimina campos no definidos en el schema
    convert: true, // convierte "1" -> 1, etc.
});

/** Update parcial (PATCH /personas/:id) */
export const updatePersonValidationSchema = Joi.object({
    id_usuario: Joi.number().integer().allow(null).optional(),
    nombre: Joi.string().trim().min(2).max(120).optional(),
    apellido: Joi.string().trim().min(2).max(120).optional(),
    activo: Joi.number().valid(0, 1).optional(),
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

/** Soft delete / toggle activo (PATCH /personas/:id/activo) */
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

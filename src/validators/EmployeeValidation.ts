import Joi from "joi";

/** Ajustá tus opciones de ENUM acá (una sola fuente de verdad) */
export const TURNOS = ["manana", "tarde", "noche"] as const;
export const TIPOS = ["interno", "externo"] as const;

/** Alta (POST /empleados) */
export const createEmployeeValidationSchema = Joi.object({
    id_persona: Joi.number().integer().required().messages({
        "any.required": `"id_persona" es requerido`,
        "number.base": `"id_persona" debe ser numérico`,
    }),
    turno: Joi.string()
        .valid(...TURNOS)
        .required()
        .messages({
            "any.required": `"turno" es requerido`,
            "any.only": `"turno" debe ser uno de: ${TURNOS.join(", ")}`,
        }),
    tipo: Joi.string()
        .valid(...TIPOS)
        .required()
        .messages({
            "any.required": `"tipo" es requerido`,
            "any.only": `"tipo" debe ser uno de: ${TIPOS.join(", ")}`,
        }),
}).options({
    abortEarly: false,
    stripUnknown: true,
    convert: true,
});

/** Update parcial (PATCH /empleados/:id) */
export const updateEmployeeValidationSchema = Joi.object({
    id_persona: Joi.number().integer().optional(),
    turno: Joi.string()
        .valid(...TURNOS)
        .optional(),
    tipo: Joi.string()
        .valid(...TIPOS)
        .optional(),
})
    .min(1)
    .messages({ "object.min": "Debes enviar al menos un campo para actualizar" })
    .options({
        abortEarly: false,
        stripUnknown: true,
        convert: true,
    });

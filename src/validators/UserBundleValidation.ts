import Joi from "joi";

// Reutilizá tus validaciones de user y person tal cual
import { createUserValidationSchema, updateUserValidationSchema } from "./UserValidation";
import { createPersonValidationSchema, updatePersonValidationSchema } from "./PersonValidation";

// Reutilizamos los ENUMs de Employee para no duplicar valores
import { TURNOS, TIPOS, updateEmployeeValidationSchema } from "./EmployeeValidation";

/**
 * En el bundle, employee NO debe recibir id_persona.
 * Solo validamos turno y tipo, y prohibimos explícitamente id_persona.
 */
const createEmployeeForBundleSchema = Joi.object({
    turno: Joi.string()
        .valid(...TURNOS)
        .required()
        .messages({
            "any.only": `"turno" debe ser uno de: ${TURNOS.join(", ")}`,
            "any.required": `"turno" es requerido`,
        }),
    tipo: Joi.string()
        .valid(...TIPOS)
        .required()
        .messages({
            "any.only": `"tipo" debe ser uno de: ${TIPOS.join(", ")}`,
            "any.required": `"tipo" es requerido`,
        }),
    id_persona: Joi.forbidden().messages({
        "any.unknown": `"id_persona" no debe enviarse en el bundle`,
    }),
});

export const createUserBundleValidationSchema = Joi.object({
    user: createUserValidationSchema.required(),
    person: createPersonValidationSchema.required(),
    employee: createEmployeeForBundleSchema.required(),
    roles: Joi.array()
        .items(Joi.number().integer().positive())
        .min(1)
        .unique()
        .required()
        .messages({
            "array.min": `"roles" debe tener al menos un rol`,
            "any.required": `"roles" es requerido`,
        }),
}).options({
    abortEarly: false,
    stripUnknown: true,
    convert: true,
});

export const updateUserBundleValidationSchema = Joi.object({
    user: updateUserValidationSchema.optional(),
    person: updatePersonValidationSchema.optional(),
    employee: updateEmployeeValidationSchema.optional(),
})
    .min(1) // obliga a que venga al menos un bloque
    .options({
        abortEarly: false,
        stripUnknown: true,
        convert: true,
    });

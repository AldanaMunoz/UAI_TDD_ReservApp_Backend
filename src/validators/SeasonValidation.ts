// src/validators/SeasonValidation.ts
import Joi from "joi";

export const createSeasonValidationSchema = Joi.object({
  stationId: Joi.number().integer().positive(),
  name: Joi.string().trim().min(2).max(50),
  year: Joi.number().integer().min(1900).max(3000).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).required().messages({
    "date.min": "endDate debe ser mayor o igual que startDate",
  }),
}).or("stationId", "name").options({
  abortEarly: false,
  stripUnknown: true,
  convert: true,
});

export const updateSeasonValidationSchema = Joi.object({
  stationId: Joi.number().integer().positive(),
  year: Joi.number().integer().min(1900).max(3000),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).messages({
    "date.min": "endDate debe ser mayor o igual que startDate",
  }),
})
  .min(1) // al menos un campo
  .options({
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

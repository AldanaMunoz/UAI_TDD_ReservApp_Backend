// src/middlewares/validationMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";

const validationMiddleware = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation error",
        detail: error.details.map((d) => d.message),
      });
    }

    // Reemplazamos el body por el objeto validado/coaccionado
    req.body = value;
    next();
  };
};

export default validationMiddleware;

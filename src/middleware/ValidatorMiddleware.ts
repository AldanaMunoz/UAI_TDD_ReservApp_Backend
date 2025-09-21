import { Request, Response, NextFunction } from "express";
import { Schema, ValidationResult } from "joi";

const validationMiddleware = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error }: ValidationResult = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation error",
        detail: error.details.map((d) => d.message),
      });
    }
    next();
  };
};

export default validationMiddleware;

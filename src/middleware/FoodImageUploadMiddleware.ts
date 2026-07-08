import multer from "multer";
import type { NextFunction, Request, Response } from "express";

const MAX_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024;

const foodImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE_IN_BYTES,
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== "image/jpeg") {
            return cb(new Error("Solo se permiten imagenes JPG"));
        }

        return cb(null, true);
    },
});

export function uploadFoodImage(req: Request, res: Response, next: NextFunction) {
    foodImageUpload.single("image")(req, res, (error: unknown) => {
        if (!error) return next();

        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "La imagen no puede superar los 5MB" });
        }

        const message = error instanceof Error ? error.message : "Error al procesar la imagen";
        return res.status(400).json({ message });
    });
}

export default foodImageUpload;

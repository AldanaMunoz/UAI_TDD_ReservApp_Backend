import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import path from "node:path";

const MAX_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024;

const foodImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE_IN_BYTES,
    },
    fileFilter: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if (file.mimetype !== "image/jpeg" || ![".jpg", ".jpeg"].includes(extension)) {
            return cb(new Error("Solo se permiten imagenes JPG"));
        }

        return cb(null, true);
    },
});

export function uploadFoodImage(req: Request, res: Response, next: NextFunction) {
    foodImageUpload.single("image")(req, res, (error: unknown) => {
        if (!error) {
            if (req.file) {
                const bytes = req.file.buffer;
                const hasJpegSignature =
                    bytes.length >= 4 &&
                    bytes[0] === 0xff &&
                    bytes[1] === 0xd8 &&
                    bytes[2] === 0xff &&
                    bytes[bytes.length - 2] === 0xff &&
                    bytes[bytes.length - 1] === 0xd9;
                if (!hasJpegSignature) {
                    return res.status(400).json({ message: "El archivo no contiene una imagen JPEG valida" });
                }
            }
            return next();
        }

        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "La imagen no puede superar los 5MB" });
        }

        const message = error instanceof Error ? error.message : "Error al procesar la imagen";
        return res.status(400).json({ message });
    });
}

export default foodImageUpload;

import express from "express";
import request from "supertest";
import { uploadFoodImage } from "../middleware/FoodImageUploadMiddleware";

function testApp() {
  const app = express();
  app.patch("/image", uploadFoodImage, (req, res) => {
    res.status(200).json({ size: req.file?.size, field: req.file?.fieldname });
  });
  return app;
}

const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xd9]);

describe("uploadFoodImage", () => {
  test("acepta un JPEG real en el campo image", async () => {
    const response = await request(testApp())
      .patch("/image")
      .attach("image", validJpeg, { filename: "food.jpeg", contentType: "image/jpeg" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ size: validJpeg.length, field: "image" });
  });

  test("rechaza contenido falso aunque use extension jpg y MIME de JPEG", async () => {
    const response = await request(testApp())
      .patch("/image")
      .attach("image", Buffer.from("not-a-jpeg"), { filename: "food.jpg", contentType: "image/jpeg" });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/contenido real no es JPEG/i);
  });

  test("rechaza extensiones distintas de jpg y jpeg", async () => {
    const response = await request(testApp())
      .patch("/image")
      .attach("image", validJpeg, { filename: "food.png", contentType: "image/jpeg" });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/solo se aceptan archivos \.jpg o \.jpeg/i);
  });

  test("rechaza archivos mayores de 5 MB", async () => {
    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1, 1);
    oversized[0] = 0xff; oversized[1] = 0xd8; oversized[2] = 0xff;
    const response = await request(testApp())
      .patch("/image")
      .attach("image", oversized, { filename: "food.jpg", contentType: "image/jpeg" });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/5MB/i);
  });
});

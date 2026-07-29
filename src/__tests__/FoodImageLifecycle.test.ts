import fs from "node:fs/promises";
import path from "node:path";

let food = { id: 900001, foodTypeId: 1, name: "Comida de prueba", imageUrl: null as string | null, isActive: true };
const findById = jest.fn(async () => ({ ...food }));
const updatePartial = jest.fn(async (_id: number, patch: { imageUrl?: string | null }) => {
  food = { ...food, ...patch };
  return { ...food };
});

jest.mock("../models/FoodModel", () => ({
  __esModule: true,
  default: { findById, updatePartial, hardDelete: jest.fn() },
}));

const uploadsRoot = path.resolve(".test-uploads");
process.env.UPLOADS_DIR = uploadsRoot;

const Controller = require("../controllers/FoodController").default;
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x10, 0x20, 0xff, 0xd9]);

function response() {
  const result: any = { statusCode: 200, body: undefined };
  result.status = jest.fn((statusCode: number) => { result.statusCode = statusCode; return result; });
  result.json = jest.fn((body: unknown) => { result.body = body; return result; });
  return result;
}

afterAll(async () => {
  const relative = path.relative(process.cwd(), uploadsRoot);
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
    await fs.rm(uploadsRoot, { recursive: true, force: true });
  }
});

test("carga, reemplaza y elimina la imagen sin dejar el archivo anterior", async () => {
  const firstResponse = response();
  await Controller.updateFoodImage(
    { params: { id: String(food.id) }, file: { buffer: jpeg } } as any,
    firstResponse,
  );
  expect(firstResponse.statusCode).toBe(200);
  const firstUrl = food.imageUrl!;
  const firstPath = path.join(uploadsRoot, firstUrl.replace(/^\/uploads\//, ""));
  await expect(fs.stat(firstPath)).resolves.toBeDefined();

  const secondResponse = response();
  await Controller.updateFoodImage(
    { params: { id: String(food.id) }, file: { buffer: jpeg } } as any,
    secondResponse,
  );
  expect(secondResponse.statusCode).toBe(200);
  expect(food.imageUrl).not.toBe(firstUrl);
  await expect(fs.stat(firstPath)).rejects.toMatchObject({ code: "ENOENT" });

  const currentPath = path.join(uploadsRoot, food.imageUrl!.replace(/^\/uploads\//, ""));
  await expect(fs.stat(currentPath)).resolves.toBeDefined();

  const deleteResponse = response();
  await Controller.deleteFoodImage({ params: { id: String(food.id) } } as any, deleteResponse);
  expect(deleteResponse.statusCode).toBe(200);
  expect(food.imageUrl).toBeNull();
  await expect(fs.stat(currentPath)).rejects.toMatchObject({ code: "ENOENT" });
});

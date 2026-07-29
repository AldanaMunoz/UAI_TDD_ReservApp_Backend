import request from "supertest";

const execute = jest.fn().mockResolvedValue([[{ ok: 1 }], []]);
const query = jest.fn().mockResolvedValue([[{ ok: 1 }], []]);

jest.mock("../db/db", () => ({
  __esModule: true,
  default: { execute, query, getConnection: jest.fn() },
  connect: jest.fn(),
}));

jest.mock("../firebase", () => ({
  __esModule: true,
  default: { auth: jest.fn(() => ({ verifyIdToken: jest.fn() })) },
}));

import app from "../app";

describe("health checks", () => {
  test("GET /health/live confirma que Express esta activo", async () => {
    const response = await request(app).get("/health/live");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("GET /health/ready comprueba la conexion configurada", async () => {
    const response = await request(app).get("/health/ready");
    expect(response.status).toBe(200);
    expect(query).toHaveBeenCalledWith("SELECT 1");
  });

  test("un recurso protegido rechaza pedidos sin token", async () => {
    const response = await request(app).get("/api/foods");
    expect(response.status).toBe(401);
  });
});

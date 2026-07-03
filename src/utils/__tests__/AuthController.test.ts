import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { loginLocalFirebase } from "../../controllers/UserController"; // Ajustá esta ruta
import UserModel from "../../models/UserModel"; // Ajustá esta ruta
import SessionLogService from "../../services/SessionLogService"; // Ajustá esta ruta
import axios from "axios";

// Función helper para imprimir en consola de forma limpia
function printLine(text: string): void {
  process.stdout.write(text + "\n");
}

// 1. Le decimos a Jest que intercepte y "congele" estas dependencias
jest.mock("axios");
jest.mock("../../models/UserModel");
jest.mock("../../services/SessionLogService");
jest.mock("../../firebase", () => ({
  __esModule: true,
  default: {
    auth: jest.fn(),
  },
}));

// Tipamos axios para que TypeScript nos deje usar los métodos de Jest
const mockedAxios = axios as jest.Mocked<typeof axios>;
const findOneByEmailMock = UserModel.findOneByEmail as jest.MockedFunction<
  typeof UserModel.findOneByEmail
>;
const comparePasswordMock = UserModel.comparePassword as jest.MockedFunction<
  typeof UserModel.comparePassword
>;
const updatePartialMock = UserModel.updatePartial as jest.MockedFunction<
  typeof UserModel.updatePartial
>;
const generateSessionTokenMock =
  SessionLogService.generateSessionToken as jest.MockedFunction<
    typeof SessionLogService.generateSessionToken
  >;
const logLoginSuccessMock =
  SessionLogService.logLoginSuccess as jest.MockedFunction<
    typeof SessionLogService.logLoginSuccess
  >;

describe("loginLocalFirebase (Cobertura de Caja Blanca)", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  // 2. Antes de cada test, limpiamos los mocks y preparamos req y res
  beforeEach(() => {
    printLine("\nLimpiando mocks y preparando entorno (req, res, env) ---");
    jest.clearAllMocks();

    // Configuramos el entorno necesario para que no caiga en el return 500
    process.env.FIREBASE_API_KEY = "fake-api-key";

    jsonMock = jest.fn();
    // res.status encadena .json(), por eso mockReturnValue devuelve un objeto con jsonMock
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    res = {
      status: statusMock,
    } as Partial<Response>;
  });

  // =================================================================
  // CASO DE PRUEBA 1: Ruta 2 (Validación de entrada)
  // Camino: 1-2-3-4-27
  // =================================================================
  it("Ruta 2: debería retornar 400 si falta la contraseña", async () => {
    printLine(
      "INICIANDO TEST: Ruta 2 (Validación de entrada - Falta password)",
    );
    req = { body: { email: "test@correo.com" } }; // Falta password
    printLine("  -> Request body configurado: " + JSON.stringify(req.body));

    printLine("  -> Ejecutando controlador loginLocalFirebase...");
    await loginLocalFirebase(req as Request, res as Response);

    printLine("  -> Verificando aserciones (Expects)...");
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "email y contraseña son obligatorios",
    });
    printLine("TEST EXITOSO: Devolvió 400 correctamente.");
  });

  // =================================================================
  // CASO DE PRUEBA 2: Ruta 5 (Falla validación local)
  // Camino: 1-2-3-5-6-8-10-11-27
  // =================================================================
  it("Ruta 5: debería retornar 401 si la contraseña local es incorrecta", async () => {
    printLine(
      "INICIANDO TEST: Ruta 5 (Falla validación local - Contraseña incorrecta)",
    );
    req = { body: { email: "test@correo.com", password: "wrong-password" } };
    printLine("  -> Request body configurado: " + JSON.stringify(req.body));

    // Simulamos que el usuario EXISTE y está ACTIVO
    printLine("  -> Configurando Mock DB: Usuario existe, sin firebaseUID");
    findOneByEmailMock.mockResolvedValue({
      id: 123,
      email: "test@correo.com",
      activo: 1,
      password: "hashed_password",
      firebaseUID: undefined, // Sin vincular aún
    });

    // Simulamos que la contraseña NO COINCIDE
    printLine(
      "  -> Configurando Mock UserModel: comparePassword retorna false",
    );
    comparePasswordMock.mockResolvedValue(false);

    printLine("  -> Ejecutando controlador loginLocalFirebase...");
    await loginLocalFirebase(req as Request, res as Response);

    printLine("  -> Verificando aserciones (Expects)...");
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Credenciales inválidas (local)",
    });
    expect(UserModel.findOneByEmail).toHaveBeenCalledWith("test@correo.com");
    printLine(
      "TEST SUPERADO: Devolvió 401 tras fallar la comparación de contraseña.",
    );
  });

  // =================================================================
  // CASO DE PRUEBA 3: Ruta 13 (Happy Path - Sin UID previo)
  // Camino: 1-2-3-5-6-8-10-12-14-15-18-19-20-21-27
  // =================================================================
  it("Ruta 13: Login exitoso, vincula firebaseUID y registra sesión", async () => {
    printLine(
      "INICIANDO TEST: Ruta 13 (Happy Path - Login exitoso sin firebaseUID previo)",
    );
    req = { body: { email: "test@correo.com", password: "correct-password" } };
    printLine("  -> Request body configurado: " + JSON.stringify(req.body));

    // 1. Mock DB (Usuario existe, activo, SIN firebaseUID)
    printLine("  -> Configurando Mock DB: Usuario existe, activo");
    findOneByEmailMock.mockResolvedValue({
      id: 123,
      email: "test@correo.com",
      activo: 1,
      password: "hashed_password",
      firebaseUID: undefined,
    });

    printLine("  -> Configurando Mock UserModel: comparePassword retorna true");
    comparePasswordMock.mockResolvedValue(true); // Password OK

    // 2. Mock Axios (Firebase responde OK)
    printLine("  -> Configurando Mock Axios: Respuesta exitosa de Firebase");
    mockedAxios.post.mockResolvedValue({
      data: {
        localId: "firebase_uid_789",
        idToken: "fake_id_token",
        refreshToken: "fake_refresh_token",
        expiresIn: "3600",
      },
    });

    // 3. Mock Servicios (Actualización de DB y log de sesión OK)
    printLine(
      "  -> Configurando Mocks Servicios: updatePartial y SessionLog OK",
    );
    updatePartialMock.mockResolvedValue({
      id: 123,
      email: "test@correo.com",
      activo: 1,
      password: "hashed_password",
      firebaseUID: "firebase_uid_789",
    });
    generateSessionTokenMock.mockReturnValue("fake-session-token");
    logLoginSuccessMock.mockResolvedValue({
      id: 1,
      userId: 123,
      firebaseUID: "firebase_uid_789",
      sessionToken: "fake-session-token",
      loginSuccess: 1,
      authProvider: "local_firebase",
    });

    // Ejecutamos el controlador
    printLine("  -> Ejecutando controlador loginLocalFirebase...");
    await loginLocalFirebase(req as Request, res as Response);

    // Verificamos que pasó por todos los nodos de éxito
    printLine("  -> Verificando aserciones (Expects)...");
    expect(UserModel.updatePartial).toHaveBeenCalledWith(123, {
      firebaseUID: "firebase_uid_789",
    });
    expect(SessionLogService.logLoginSuccess).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(200);

    // Verificamos la estructura final del json devuelto
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Inicio de sesión OK (local + firebase)",
        sessionToken: "fake-session-token",
        user: expect.objectContaining({
          id: 123,
          firebaseUID: "firebase_uid_789",
        }),
      }),
    );
    printLine("TEST EXITOSO: Flujo completo ejecutado correctamente.");
  });
});

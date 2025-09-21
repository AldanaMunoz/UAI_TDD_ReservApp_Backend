import "dotenv/config";
import express from "express";
import cors from "cors";
import { connect } from "./db/db"; // 👈 importamos la función connect
import routes from "./routes";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    // Probar conexión antes de iniciar
    await connect();

    // Ruta raíz
    app.get("/", (_req, res) => {
      res.send("🚀 Servidor Express con TypeScript y MySQL2 funcionando!");
    });

    // Todas las rutas desde routes/index.ts
    app.use("/api", routes);

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ No se pudo iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();

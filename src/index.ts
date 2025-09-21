import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db/db";   // ahora sí trae también .connect()
import routes from "./routes";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    // ✅ ahora podés hacer esto
    await db.connect();

    app.get("/", (_req, res) => {
      res.send("🚀 Servidor Express con TypeScript y MySQL2 funcionando!");
    });

    app.use("/", routes);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ No se pudo iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();

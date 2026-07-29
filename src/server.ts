import "dotenv/config";
import app from "./app";
import { connect } from "./db/db";

const port = Number(process.env.PORT) || 3001;

async function startServer() {
  try {
    await connect();
    app.listen(port, () => {
      console.log(`EXITO. Servidor corriendo en http://localhost:${port}`);
    });
  } catch (error) {
    console.error("ERROR. No se pudo iniciar el servidor:", error);
    process.exit(1);
  }
}

void startServer();

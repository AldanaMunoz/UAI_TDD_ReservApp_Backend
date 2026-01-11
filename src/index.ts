import "dotenv/config";
import express from "express";
import cors from "cors";
import { connect } from "./db/db";
import routes from "./routes";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';


const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (_req, res) => res.type('application/json').json(swaggerSpec));

// Middlewares globales
app.use(
    cors({
        origin: (origin, cb) => {
            // Si no hay origin (ej: curl/Postman), permitir
            if (!origin) return cb(null, true);

            // Permitir cualquier localhost en cualquier puerto
            if (/^http:\/\/localhost:\d+$/.test(origin)) {
                return cb(null, true);
            }

            // Si no es localhost, rechazar
            return cb(new Error("CORS not allowed"));
        },
        credentials: true, // necesario si usás cookies
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

async function startServer() {
    try {
        // Probar conexión antes de iniciar
        await connect();

        // Ruta raíz
        app.get("/", (_req, res) => {
            res.send("EXITO. Servidor Express con TypeScript y MySQL2 funcionando!");
        });

        // Todas las rutas desde routes/index.ts
        app.use("/api", routes);

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`EXITO. Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("ERROR. No se pudo iniciar el servidor:", error);
        process.exit(1);
    }
}

startServer();

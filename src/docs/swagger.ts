// src/docs/swagger.ts
import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "API ReservApp Documentation",
        version: "1.0.0",
        description: "Documentación de la API (Users, Persons, Employees, Foods, FoodTypes, Auth, UserBundle)",
    },

    servers: [
        {
            url: `http://localhost:${Number(process.env.PORT)}/api`,
        },
    ],

    // ESTO HACE QUE APAREZCA EL BOTÓN "Authorize"
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Pegá aquí el idToken de Firebase obtenido en /auth/login",
            },
        },
    },

    // Hace que TODOS los endpoints requieran token por defecto excepto los que indiquen `security: []`
    security: [
        {
            bearerAuth: [],
        },
    ],
};

export const swaggerOptions = {
    swaggerDefinition,
    apis: [
        "src/routes/*.ts",
        "src/controllers/*.ts",
    ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

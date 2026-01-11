// src/docs/swagger.ts
import swaggerJSDoc, { type Options } from 'swagger-jsdoc';

const port = Number(process.env.PORT || 3000);

// Si querés, definí BASE_URL en .env (ej: http://localhost:3000 o https://api.tudominio.com)
const baseUrl = (process.env.BASE_URL || `http://localhost:${port}`).replace(/\/$/, '');
const apiPrefix = process.env.API_PREFIX || '/api';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ReservApp API',
    version: '1.0.0',
    description:
      'Documentación de la API (Auth, Users, Persons, Employees, Foods, FoodTypes, Seasons, FoodRestrictions, Roles, Permissions, etc.)',
  },

  servers: [
    { url: `${baseUrl}${apiPrefix}`, description: 'Default server' },
    // Opcional: server adicional para producción si querés fijo (ejemplo)
    ...(process.env.PROD_BASE_URL
      ? [{ url: `${String(process.env.PROD_BASE_URL).replace(/\/$/, '')}${apiPrefix}`, description: 'Production' }]
      : []),
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Pegá el Firebase idToken (Authorization: Bearer <idToken>)',
      },
    },
  },

  // Default: todo protegido. En rutas públicas agregá `security: []`
  security: [{ bearerAuth: [] }],
};

export const swaggerOptions: Options = {
  definition: swaggerDefinition,
  apis: [
    'src/routes/**/*.ts',
    'src/controllers/**/*.ts',
    // si documentás schemas/DTOs en otro lado:
    // 'src/docs/**/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

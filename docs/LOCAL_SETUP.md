# Entorno local

## Requisitos

- Node `22.x` (la version esta documentada en `.nvmrc`).
- MySQL accesible desde el backend.
- Un proyecto Firebase para uso manual o Firebase Auth Emulator para integracion.

## Puertos

- React: `3000`.
- Express: `3001`.
- MySQL: `3306`, salvo que `DB_PORT` indique otro valor.

## Backend

Crear `.env` desde `.env.example` y completar `DB_USER`, `DB_PASS` y la configuracion Firebase. Variables importantes:

```dotenv
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=reservapp
TEST_DB_NAME=reservapp_test
CORS_ORIGINS=http://localhost:3000
UPLOADS_DIR=uploads
```

Para Auth Emulator, definir `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099` y `FIREBASE_PROJECT_ID`. En ese modo no se necesita una cuenta real.

```powershell
cd TP_ReservApp_Backend
npm install
npm run db:test:setup
npm run dev
```

## Frontend

Crear `.env` desde `.env.example`:

```dotenv
PORT=3000
REACT_APP_API_URL=http://localhost:3001/api
```

```powershell
cd TP_ReservApp_Frontend
npm install
npm start
```

Las imagenes se guardan como rutas relativas `/uploads/foods/:id/...jpg`; React las resuelve contra el origen de la API.

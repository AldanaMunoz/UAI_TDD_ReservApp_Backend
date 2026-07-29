# ReservApp Backend

API Express, TypeScript y MySQL para ReservApp. La rama `tdp-v1` incorpora autenticacion con perfiles y roles, menu y reservas, planificacion, metricas, liquidaciones y administracion segura de imagenes JPEG de comidas.

## Inicio rapido

Requisitos: Node 22, MySQL y las variables de `.env.example`.

```powershell
npm install
npm run dev
```

La API queda en `http://localhost:3001`, Swagger en `/docs` y los health checks en `/health/live` y `/health/ready`.

## Verificacion

```powershell
npm run db:test:setup
npm run check
npm test -- --runInBand
npm run build
npm start
```

La base de pruebas es `reservapp_test`; el script copia solamente la estructura de las tablas y no altera ni copia los registros de `reservapp`.

Consulta [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md), [docs/TESTING.md](docs/TESTING.md) y [docs/MANUAL_QA.md](docs/MANUAL_QA.md).

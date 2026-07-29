# Pruebas

## Base aislada

`npm run db:test:setup` crea `reservapp_test` y replica las 19 tablas vacias con sus claves e indices. Es no destructivo: no ejecuta `DROP`, no copia seeds y rechaza usar el mismo nombre que `DB_NAME`.

Los tests unitarios y HTTP usan mocks de MySQL y Firebase. Los tests que se incorporen con DB real deben iniciar el proceso con `DB_NAME=reservapp_test` y `UPLOADS_DIR` temporal.

## Backend

```powershell
npm run check
npm test -- --runInBand
npm run test:coverage
npm run build
npm start
```

Se cubren health checks, rechazo sin token, login, liquidaciones, firma/extensiones/tamano JPEG y carga-reemplazo-eliminacion sin archivos huerfanos.

## Frontend

```powershell
npm run typecheck
npm run lint
$env:CI='true'; npm test -- --watchAll=false --runInBand
npm run build
npm run test:e2e
```

Jest mockea el cliente HTTP compartido. Playwright sirve el build de produccion y mockea la API en la frontera de red; no mockea la logica interna de `GestionComidas`.

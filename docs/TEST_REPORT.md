# Reporte de pruebas

Fecha: 2026-07-21.

## Baseline de datos

- `reservapp`: 248 comidas con URL de imagen y archivo valido.
- Archivos faltantes: 0.
- Archivos huerfanos: 0.
- Los seeds no se modificaron ni eliminaron.
- `reservapp_test`: creada con 19 tablas vacias.

## Automatizacion

- Backend: typecheck y build correctos; Jest: 5 suites y 16 pruebas aprobadas.
- Frontend: typecheck, lint y build correctos; Jest: 2 suites y 3 pruebas aprobadas.
- Playwright: 2 pruebas aprobadas (flujo administrador de imagenes y bloqueo de empleado).
- Consultas reales de menu y metricas ejecutadas contra MySQL; se corrigio compatibilidad con `ONLY_FULL_GROUP_BY`.

## Dependencias

- Se ejecuto `npm audit fix` sin cambios mayores en ambos proyectos.
- Backend: quedan 8 avisos moderados ligados a la cadena de Firebase/Google; resolverlos requiere actualizaciones potencialmente incompatibles.
- Frontend: quedan 28 avisos (9 bajos, 6 moderados y 13 altos) en la cadena heredada de Create React App. `npm audit fix --force` propone reemplazar `react-scripts` por una version invalida/incompatible y no se aplico.
- El proyecto fija Node `22.x`. La corrida final se realizo con Node `24.11.1` disponible en la maquina y mostro la advertencia de engine esperada; `.nvmrc` contiene `22.23.1` para las instalaciones reproducibles.

## Alcance

Las pruebas automatizadas no llaman cuentas Firebase reales ni escriben en `reservapp`. La validacion manual autenticada requiere credenciales locales o Firebase Auth Emulator.

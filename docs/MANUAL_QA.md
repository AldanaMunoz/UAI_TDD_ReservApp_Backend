# QA manual

## Preparacion

1. Levantar MySQL `reservapp`.
2. Iniciar backend en `3001` y comprobar `/health/ready`.
3. Iniciar frontend en `3000`.
4. Ingresar con un usuario cuyo rol canonico en `usuarios_roles` sea `Administrador`.

## Imagenes de comidas

1. Abrir Gestion de comidas y confirmar miniaturas o placeholder.
2. Crear una comida sin imagen.
3. Crear otra comida con un JPG menor a 5 MB y comprobar la vista previa.
4. Intentar PNG renombrado a JPG y un archivo mayor a 5 MB; ambos deben rechazarse.
5. Editar una comida y reemplazar la imagen dos veces seguidas; la anterior debe desaparecer.
6. Quitar la imagen, confirmar la accion y comprobar el placeholder.
7. Eliminar una comida con imagen y comprobar que no quede su archivo.
8. Simular fallo de red durante la carga: la comida creada debe conservarse y mostrarse un resultado parcial.

## Regresion

- Recargar la sesion y comprobar que `/auth/me` conserva nombre y roles.
- Verificar que Empleado/Cocinero accede a menu, planificacion e historial, pero no a gestion administrativa.
- Probar menu diario, alta/cancelacion de reserva, asistencia y cierre de turno.
- Probar temporadas, semanas y asignaciones de lunes a viernes.
- Abrir usuarios, liquidaciones, exportacion y cada reporte.
- Confirmar estados de carga, vacio y error sin llamadas 404.

# Backlog piloto — Aplomo Systems

## Objetivo

Convertir la demo actual en un piloto real para operación industrial.

## Prioridad 1 — Base productiva

### 1. Definir backend público

Decisión recomendada:

- Supabase para acelerar piloto.
- PostgreSQL como base principal.
- Storage para evidencia.
- Auth para usuarios.
- Realtime o polling para sincronización inicial.

Resultado esperado:

La app ya no depende solo de localStorage o backend local.

### 2. Definir modelo de datos

Entidades mínimas:

- Empresa
- Sitio
- Patio
- Zona
- Material
- Captura GPS
- Evidencia
- Usuario
- Auditoría

Resultado esperado:

Base clara para guardar información real.

### 3. Crear autenticación real

Roles mínimos:

- Admin
- Supervisor
- Operador

Resultado esperado:

Cada usuario entra con cuenta propia y permisos básicos.

### 4. Conectar frontend a backend público

Primeras funciones reales:

- Crear captura GPS.
- Listar capturas.
- Ver detalle de captura.
- Cambiar estado de captura.
- Guardar evidencia básica.

Resultado esperado:

La consola deja de ser solo demo visual y empieza a guardar datos reales.

## Prioridad 2 — Campo y evidencia

### 5. Mejorar flujo móvil

Objetivo:

Que el operador pueda capturar desde celular sin estorbo.

Revisar:

- Botones grandes.
- Menos texto.
- Mejor scroll.
- Estado de GPS claro.
- Guardado local si falla internet.
- Sin pantallas bloqueadas.

### 6. Evidencia con fotos

Funciones:

- Subir foto.
- Asociar foto a captura.
- Ver evidencia desde supervisor.
- Guardar fecha y usuario.

Resultado esperado:

Cada ubicación puede tener prueba visual.

### 7. Sincronización inicial

Versión simple:

- Guardar local.
- Marcar como pendiente.
- Enviar cuando haya conexión.
- Marcar como sincronizado.

Resultado esperado:

El sistema funciona mejor en campo.

## Prioridad 3 — Supervisión

### 8. Panel de revisión

Funciones:

- Ver capturas pendientes.
- Aprobar captura.
- Rechazar captura.
- Agregar comentario.
- Ver evidencia.
- Ver punto o perímetro en mapa.

### 9. Historial

Funciones:

- Ver cambios.
- Ver usuario responsable.
- Ver fechas.
- Ver estado anterior y nuevo.

### 10. Exportación

Formatos útiles:

- CSV
- GeoJSON
- PDF básico para reporte

## Prioridad 4 — Piloto con Cooper/T. Smith

### 11. Caso piloto limitado

No intentar cubrir toda la operación al inicio.

Caso recomendado:

- Un patio.
- Un tipo de material.
- Un flujo de captura.
- Un supervisor.
- Uno o dos operadores.
- Evidencia con foto.
- Revisión de capturas.

### 12. Métricas del piloto

Medir:

- Tiempo de captura.
- Errores de ubicación.
- Capturas completadas.
- Capturas rechazadas.
- Evidencia generada.
- Tiempo de revisión.
- Comentarios del equipo operativo.

### 13. Entregable del piloto

Debe incluir:

- Demo web.
- Datos reales o simulados de Cooper/T. Smith.
- Reporte de resultados.
- Recomendaciones.
- Próxima fase.

# Modelo de datos V1 — Aplomo Systems

## Objetivo

Este documento define el modelo base para convertir la demo actual de Aplomo Systems en un piloto real.

La idea es que el sistema pueda guardar empresas, sitios, patios, zonas, materiales, capturas GPS, evidencia, usuarios y auditoría.

## Entidades principales

### 1. Empresa

Representa al cliente.

Ejemplo:

- Cooper/T. Smith
- Cementera
- Mina
- Constructora
- Puerto
- Terminal logística

Campos sugeridos:

- id
- nombre
- slug
- estado
- fecha_creacion
- fecha_actualizacion

### 2. Sitio

Representa una ubicación física de una empresa.

Ejemplo:

- Puerto Altamira
- Patio Norte
- Planta Monterrey
- Cantera 1

Campos sugeridos:

- id
- empresa_id
- nombre
- tipo
- direccion
- latitud
- longitud
- estado
- fecha_creacion
- fecha_actualizacion

### 3. Patio

Representa un área operativa dentro de un sitio.

Campos sugeridos:

- id
- sitio_id
- nombre
- descripcion
- estado
- fecha_creacion
- fecha_actualizacion

### 4. Zona

Representa una zona dentro de un patio.

Puede ser un área de almacenamiento, una sección de maniobra, una zona restringida o un perímetro operativo.

Campos sugeridos:

- id
- patio_id
- nombre
- tipo
- descripcion
- geometria_geojson
- estado
- fecha_creacion
- fecha_actualizacion

### 5. Material

Representa el tipo de material manejado.

Ejemplo:

- Coque
- Mineral
- Cemento
- Granel agrícola
- Piedra
- Arena
- Acero
- Carga general

Campos sugeridos:

- id
- empresa_id
- nombre
- categoria
- unidad_medida
- descripcion
- estado
- fecha_creacion
- fecha_actualizacion

### 6. Pila o stockpile

Representa una pila física de material en el patio.

Campos sugeridos:

- id
- patio_id
- zona_id
- material_id
- nombre
- volumen_estimado
- unidad
- geometria_geojson
- estado_operativo
- responsable_id
- fecha_creacion
- fecha_actualizacion

### 7. Captura GPS

Representa una captura hecha en campo.

Puede ser un punto, una ruta o un perímetro.

Campos sugeridos:

- id
- empresa_id
- sitio_id
- patio_id
- zona_id
- usuario_id
- tipo
- latitud
- longitud
- precision_metros
- geometria_geojson
- estado
- notas
- capturado_en
- creado_en
- actualizado_en
- sincronizado_en

Estados sugeridos:

- borrador
- listo_para_enviar
- sincronizado
- revisado
- rechazado

### 8. Evidencia

Representa archivos asociados a una captura, material, zona o evento.

Ejemplo:

- Foto
- Video
- Documento
- Captura de pantalla
- Archivo técnico

Campos sugeridos:

- id
- empresa_id
- captura_id
- tipo
- url
- nombre_archivo
- mime_type
- tamano_bytes
- descripcion
- creado_por
- creado_en

### 9. Usuario

Representa a una persona que usa el sistema.

Campos sugeridos:

- id
- empresa_id
- nombre
- correo
- rol
- estado
- fecha_creacion
- fecha_actualizacion

Roles sugeridos:

- admin
- supervisor
- operador
- tecnico
- invitado

### 10. Evento de auditoría

Registra acciones importantes.

Ejemplo:

- Usuario creó captura.
- Supervisor revisó perímetro.
- Se sincronizó un paquete.
- Se actualizó material.
- Se eliminó evidencia.

Campos sugeridos:

- id
- empresa_id
- usuario_id
- entidad_tipo
- entidad_id
- accion
- descripcion
- metadata_json
- creado_en

## Relaciones principales

- Una empresa tiene muchos sitios.
- Un sitio tiene muchos patios.
- Un patio tiene muchas zonas.
- Una zona puede tener muchas pilas.
- Una empresa tiene muchos materiales.
- Una captura GPS pertenece a empresa, sitio, patio y usuario.
- Una captura puede estar ligada a zona, pila o material.
- Una captura puede tener muchas evidencias.
- Un usuario pertenece a una empresa.
- Los eventos de auditoría registran acciones sobre cualquier entidad importante.

## Decisión recomendada de base de datos

Para piloto real:

PostgreSQL.

Para geoespacial avanzado:

PostGIS.

Para acelerar MVP productivo:

Supabase puede ser buena opción porque incluye:

- PostgreSQL.
- Auth.
- Storage.
- Realtime.
- APIs.
- Dashboard administrativo.

## Reglas importantes

- No guardar todo como texto libre.
- Usar IDs claros.
- Separar empresa, sitio, patio y zona.
- Guardar GeoJSON para geometrías.
- Guardar auditoría desde el inicio.
- Diseñar pensando en multi-tenant.
- No asumir que solo existirá Cooper/T. Smith.
- Mantener trazabilidad de quién hizo qué y cuándo.

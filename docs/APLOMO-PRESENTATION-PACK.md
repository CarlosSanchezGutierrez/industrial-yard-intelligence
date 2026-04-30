# Aplomo Systems — Paquete de presentación técnico-negocio

Última actualización: 2026-04-29

## 1. Qué es Aplomo Systems

Aplomo Systems es una consola visual para controlar patios industriales, materiales, GPS, evidencia y operaciones en campo.

El primer caso de uso está enfocado en Cooper/T. Smith, dentro de una operación portuaria e industrial donde existen patios, materiales a granel, zonas, maquinaria, registros, supervisores, operadores y necesidad de trazabilidad física.

La idea inicial era usar GPS para marcar o trazar objetos dentro del patio. El MVP evolucionó hacia una plataforma más amplia: un sistema local-first para convertir operación física en datos operativos, mapas, historial y evidencia.

## 2. Problema operativo

En patios industriales, la información crítica suele estar distribuida entre campo, supervisores, registros manuales, fotografías, mensajes, reportes y memoria operativa del personal.

Eso genera problemas como:

- Incertidumbre sobre dónde está exactamente un material.
- Falta de trazabilidad clara entre captura, evidencia y supervisión.
- Dificultad para delimitar zonas o pilas.
- Registros incompletos o poco estandarizados.
- Dependencia de comunicación informal.
- Pérdida de tiempo al buscar materiales, zonas o evidencia.
- Dificultad para auditar decisiones operativas.
- Baja visibilidad para dirección, supervisión y administración.

## 3. Propuesta de valor

Aplomo Systems propone una consola donde el equipo pueda:

- Visualizar patios y zonas en mapa.
- Capturar puntos GPS.
- Dibujar perímetros.
- Asociar materiales, estados, responsables y fechas.
- Guardar evidencia.
- Revisar historial.
- Simular sincronización campo-supervisor.
- Operar con lógica local-first para escenarios con internet inestable.
- Preparar el camino hacia app móvil, backend público, base de datos cloud, analítica, IA, sensores y drones.

Frase simple:

"Aplomo ayuda a convertir un patio físico en una operación digital trazable."

## 4. Qué ya existe en el MVP

Actualmente ya existe un MVP web público:

https://aplomosystems.com

El sistema ya incluye:

- Pantalla inicial de presentación.
- Consola operativa web.
- Mapa operativo.
- Uso de GPS del dispositivo.
- Captura de puntos.
- Dibujo de perímetros.
- Visualización de datos de patio.
- Materiales, registros y módulos operativos.
- Simulación de captura en campo.
- Simulación de supervisor receptor.
- Checklist de captura.
- Paquete GPS.
- Persistencia local en navegador.
- Preparación conceptual para sincronización.
- Backend GPS local como base técnica.
- Deploy público en Vercel.
- Dominio propio.
- Social preview profesional.
- Monorepo TypeScript modular.

## 5. Qué no se debe prometer todavía

Para mantener credibilidad técnica y comercial, no se debe afirmar todavía que:

- Ya existe backend público completo en producción.
- Ya hay autenticación real por usuarios, roles y empresas.
- Ya existe app móvil nativa.
- Ya hay integración real con drones.
- Ya hay sensores físicos conectados.
- Ya existe IA productiva.
- Ya está listo como sistema empresarial final.

La forma correcta de decirlo:

"El MVP web ya está desplegado y demuestra la experiencia principal. La siguiente fase es convertir esta base en un sistema productivo con autenticación, backend público, base de datos cloud, evidencia robusta y sincronización real."

## 6. Arquitectura técnica resumida

El proyecto está construido como monorepo con TypeScript.

Estructura general:

- apps/web: aplicación web principal.
- apps/api: backend local/API.
- apps/edge: capa futura o experimental de edge/runtime.
- packages/kernel: lógica base compartida.
- packages/design-tokens: tokens de diseño.
- packages/seed-data: datos iniciales.
- packages/audit: auditoría.
- packages/domain: conceptos de negocio.
- packages/media: manejo de evidencia.
- packages/db: capa de datos.
- packages/spatial: lógica geoespacial.
- packages/sync-protocol: protocolo de sincronización.
- packages/api-contracts: contratos entre frontend/backend.
- packages/sync-core: base de sincronización.

Tecnologías principales:

- React.
- TypeScript.
- Vite.
- pnpm.
- Leaflet / mapas.
- OpenStreetMap.
- Browser Geolocation API.
- localStorage/local-first.
- Node/TypeScript para API local.
- Vercel para frontend público.

## 7. Explicación para no técnicos

Frontend:
Lo que el usuario ve y usa: pantallas, botones, mapa, formularios, consola y experiencia visual.

Backend:
La parte que recibe, procesa y guarda información. En este MVP ya existe base local para capturas GPS, aunque falta desplegar backend público completo.

Base de datos:
Lugar donde se guardarán registros, capturas, usuarios, materiales, evidencia, historial y eventos. En MVP se usa persistencia local y archivos/estructuras base. En producción conviene PostgreSQL.

API:
Canales por donde la aplicación web se comunica con el backend.

Local-first:
El sistema debe poder registrar información aunque en campo haya mala conexión. Después debe sincronizarse cuando vuelva internet.

QA/testing:
Pruebas para comprobar que la app compila, que TypeScript no falla y que el sistema no se rompe antes de publicarlo.

Hosting:
Publicación del sistema en internet. El frontend ya está desplegado en Vercel.

## 8. Aportación desde Ingeniería Industrial

Aunque el desarrollo técnico sea fuerte, el proyecto también tiene base clara de Ingeniería Industrial:

- Gestión visual de operaciones.
- Control de patios y materiales.
- Trazabilidad.
- Estandarización de registros.
- Reducción de incertidumbre operativa.
- Mejora en flujo de información campo-supervisión.
- Apoyo a toma de decisiones.
- Prevención de errores por mala ubicación o falta de evidencia.
- Digitalización de procesos físicos.
- Diseño de flujo operativo.
- Mejora continua.
- Control de calidad de captura.
- Organización de recursos, zonas, materiales y responsables.

En términos industriales, Aplomo no solo es software: es una herramienta para ordenar, visualizar y controlar un proceso físico.

## 9. Guion corto para Cooper/T. Smith

"Desarrollamos un primer MVP de Aplomo Systems, una consola visual para controlar patios industriales. La idea inicial era registrar ubicaciones con GPS, pero la convertimos en una base más completa para visualizar zonas, materiales, evidencia, registros y operación de campo.

Hoy ya existe una versión web pública en aplomosystems.com. Esta versión permite mostrar el flujo principal: entrar a la consola, visualizar el patio, usar mapa, capturar puntos GPS, dibujar perímetros y simular cómo una captura de campo puede llegar a supervisión.

Todavía no lo estamos presentando como sistema final cerrado. Lo estamos presentando como una base funcional y escalable. La siguiente fase sería agregar autenticación real, base de datos cloud, backend público, evidencia con fotos, roles de usuario y sincronización real entre campo y supervisión."

## 10. Guion corto para profesores

"El proyecto evolucionó de una idea de GPS para marcar zonas a un MVP funcional de una plataforma de gestión visual para patios industriales.

Desde Ingeniería Industrial, el aporte está en la trazabilidad, estandarización de registros, control visual, mejora del flujo de información, reducción de incertidumbre en inventarios físicos y apoyo a la toma de decisiones operativas.

Desde la parte técnica, ya existe una aplicación web desplegada, una arquitectura modular, frontend, base de backend local, lógica de GPS, mapas, persistencia local, documentación, pruebas de compilación y una ruta clara hacia SaaS industrial."

## 11. Guion corto para compañeras de equipo

"Ya tenemos una versión web publicada de Aplomo Systems. No es solo una página bonita: es una primera consola operativa para mostrar mapa, GPS, zonas, materiales, registros y simulación de captura en campo.

Lo importante para explicar es que el sistema ayuda a que una operación física de patio se convierta en información digital ordenada: dónde está algo, cuándo se registró, quién lo capturó, qué evidencia tiene y cómo lo revisa supervisión.

La siguiente fase sería hacerlo más real con usuarios, base de datos, evidencia con fotos, sincronización y app móvil."

## 12. Guion técnico para GitHub

"Este repositorio contiene el MVP de Aplomo Systems, una plataforma web local-first para gestión visual de patios industriales. Está construido como monorepo TypeScript con aplicación web React/Vite, paquetes compartidos, contratos de API, módulos de dominio, lógica de sincronización y backend local para capturas GPS.

El objetivo técnico es mantener una arquitectura modular preparada para SaaS industrial multi-tenant, operación offline, geolocalización, evidencia, auditoría, sincronización, analítica y futuras integraciones con sensores, drones e IA."

## 13. Roadmap recomendado

### Fase 1 — MVP demostrable

Estado: en curso / avanzado.

- Web pública.
- Dominio.
- Intro.
- Mapa.
- GPS.
- Perímetros.
- Registros visuales.
- Demo local-first.
- Documentación.
- Build/typecheck.
- Repositorio GitHub.

### Fase 2 — Producto piloto

- Autenticación real.
- Empresas/tenants.
- Usuarios.
- Roles.
- Base de datos PostgreSQL.
- Backend público.
- Evidencia con imágenes.
- Sincronización real.
- Mejor manejo offline.
- Reportes básicos.
- Mejor UX móvil.

### Fase 3 — SaaS industrial

- Multi-sitio.
- Auditoría avanzada.
- Dashboards.
- Analítica.
- Exportaciones.
- Integraciones.
- Permisos finos.
- PWA avanzada.
- App móvil si se justifica.

### Fase 4 — Plataforma industrial inteligente

- PostGIS.
- Capas geoespaciales.
- Drones.
- Sensores.
- IA para clasificación, anomalías, reportes y estimaciones.
- Data pipelines.
- Modelos predictivos.
- Integraciones empresariales.

## 14. Defensa estratégica

Aplomo Systems no debe venderse como "una app escolar".

Debe venderse como:

- MVP real.
- Producto industrial temprano.
- Base de SaaS.
- Proyecto técnicamente defendible.
- Plataforma con potencial de crecimiento.
- Herramienta práctica para empresas clásicas.
- Portafolio fuerte de ingeniería aplicada.

La ventaja no está solo en tener mapa o GPS. La ventaja está en juntar operación física, evidencia, trazabilidad, datos, sincronización y visión SaaS en una sola plataforma.

## 15. Frase final

Aplomo Systems busca que las industrias físicas puedan ver, registrar y controlar su operación real con mapas, datos, evidencia y trazabilidad.

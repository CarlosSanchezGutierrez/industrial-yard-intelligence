# Checklist QA — MVP Aplomo Systems

Última actualización: 2026-04-29

## Producción

URL:

https://aplomosystems.com

## Revisión en celular

- Abrir el sitio desde datos móviles y Wi-Fi.
- Confirmar que la pantalla inicial carga.
- Confirmar que los botones "Siguiente", "Atrás" y "Entrar al sistema" son visibles.
- Confirmar que se puede entrar a la consola.
- Confirmar que no hay scroll bloqueado.
- Confirmar que el mapa carga.
- Confirmar que el navegador solicita permiso de ubicación al usar GPS.
- Confirmar que si se niega el permiso, el sistema no se rompe.
- Confirmar que la UI sigue legible en pantalla pequeña.

## Revisión en desktop

- Abrir el sitio en navegador normal.
- Confirmar que el dominio no muestra ruta rara como hash inicial innecesario.
- Confirmar que la consola carga.
- Confirmar que el menú principal responde.
- Confirmar que el mapa carga.
- Confirmar que los módulos siguen visibles.
- Confirmar que no hay fondos blancos con texto blanco.
- Confirmar que no hay barra superior duplicada.
- Confirmar que el nombre visible del producto es Aplomo Systems.

## Revisión de social preview

- Confirmar título: Aplomo Systems — Software para patios industriales.
- Confirmar descripción industrial.
- Confirmar imagen: /og-aplomo.png.
- Si WhatsApp o LinkedIn muestran imagen vieja, puede ser caché de la plataforma.

## Revisión técnica local

Comandos base:

pnpm --filter @iyi/web... build
pnpm typecheck

Si se toca API:

pnpm --filter @iyi/api build
pnpm typecheck

Si se toca GPS backend local:

pnpm dev:stack:windows
pnpm gps:smoke

## Criterio para presentar

La demo está lista para mostrarse si:

- Producción abre.
- La intro no bloquea.
- La consola se ve seria.
- El mapa carga.
- GPS no rompe la app.
- El discurso aclara que backend público, auth y app móvil son siguiente fase.

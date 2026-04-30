# Panel interno de administración operativa — Aplomo Systems

## Objetivo

Crear un panel visual interno para administradores, usando el simulador gobernado de dispositivos vivos.

## Archivo principal

apps/web/src/internal/AplomoOperationsAdminPanel.tsx

## Cómo abrirlo

https://aplomosystems.com/?aplomoInternal=1

## Qué permite ver

- Total de dispositivos.
- Sesiones activas.
- Conexiones online.
- Posiciones vivas.
- Eventos gobernados.
- Eventos de alta precisión.
- Precisión GPS promedio.
- Calidad de datos promedio.
- Tabla de dispositivos.
- Tabla de posiciones vivas.
- Tabla de eventos gobernados recientes.
- Data contracts.
- Política IA.
- Lineage.

## Qué permite hacer

- Avanzar la simulación 1 tick.
- Avanzar la simulación 10 ticks.
- Reiniciar demo.
- Filtrar por búsqueda.
- Filtrar por tipo de dispositivo.
- Filtrar por fuente GPS.
- Filtrar por dispositivo específico.

## Qué representa

Este panel es el inicio del futuro panel de administración SaaS.

Hoy usa simulación local.

Después deberá conectarse a:

- API real.
- Supabase/Postgres.
- Realtime.
- Mapa visual.
- Analítica.
- Alertas.
- IA/multiagentes.

## Importante

Este panel sigue oculto por `?aplomoInternal=1`.

No afecta la demo normal.

No depende todavía de Supabase.

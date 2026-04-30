# Paso 1 — Dominio de dispositivos y telemetría

## Objetivo

Crear la base de dominio para que Aplomo Systems pueda manejar dispositivos industriales, emisores, receptores, sesiones, conexiones y telemetría GPS.

## Archivos creados

- packages/domain/src/aplomoDevice.ts
- packages/domain/src/aplomoConnection.ts
- packages/domain/src/aplomoTelemetry.ts
- packages/domain/src/aplomoRoles.ts

## Qué queda definido

### Dispositivos

- Celular.
- Tablet.
- Dron.
- GPS/GNSS profesional.
- RTK base.
- RTK rover.
- Estación total.
- Gateway IoT.
- Camión.
- Máquina.
- Antena.
- Bastón topográfico.
- Consola de navegador.

### Capacidades

- GPS.
- GPS de alta precisión.
- RTK.
- Cámara.
- Bluetooth.
- WiFi.
- Celular.
- Serial USB.
- NMEA.
- MQTT.
- WebSocket.
- Captura de evidencia.
- Streaming en tiempo real.

### Conexiones

- Emisor.
- Receptor.
- Ambos.
- Browser.
- Mobile app.
- Bluetooth.
- USB serial.
- MQTT.
- WebSocket.
- Gateway.
- NMEA stream.
- Drone link.
- RTK link.

### Telemetría

- Posición GPS.
- Calidad GPS.
- Fix type.
- RTK status.
- Precisión.
- Satélites.
- HDOP.
- VDOP.
- Altitud.
- Velocidad.
- Rumbo.
- Última posición conocida.

### Roles y permisos

- Owner.
- Admin.
- Supervisor.
- Operator.
- Technician.
- Viewer.
- Guest.

## Regla arquitectónica

Este paso no depende de Supabase.

Supabase será un adaptador.

Aplomo debe tener su propio dominio independiente.

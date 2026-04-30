# Integración de dispositivos industriales reales — Aplomo Systems

## Objetivo

Preparar Aplomo para conectarse a dispositivos reales de grado industrial sin acoplar el sistema a una marca o a un solo tipo de hardware.

## Principio

Aplomo no se conecta directamente a dispositivos.

Aplomo se conecta a adaptadores.

Un adaptador puede leer:

- Navegador.
- App móvil.
- Bluetooth.
- USB serial.
- RS232.
- TCP.
- UDP.
- MQTT.
- NMEA.
- RTCM.
- NTRIP.
- MAVLink.
- SDK propietario.
- API cloud de proveedor.
- CSV.
- GeoJSON.

## Tipos de dispositivos considerados

- Celular.
- Tablet.
- Dron.
- GNSS receiver.
- RTK base.
- RTK rover.
- Bastón topográfico.
- Antena.
- Gateway IoT.
- Camión.
- Máquina.

## Por qué importa

Muchos dispositivos industriales no tienen un sistema operativo “normal” como una laptop.

Algunos tienen firmware embebido.

Algunos solo transmiten datos por serial o Bluetooth.

Algunos requieren una app del fabricante.

Algunos requieren un gateway.

Algunos operan por MQTT.

Algunos drones requieren MAVLink o SDK propietario.

Por eso el diseño correcto es tener perfiles de integración y adaptadores.

## Archivos creados

- packages/domain/src/aplomoIndustrialDeviceIntegration.ts
- packages/api-contracts/src/aplomoIndustrialDeviceIntegrationContracts.ts

## Siguiente paso

Conectar estos perfiles al simulador y al panel interno para que cada dispositivo muestre:

- patrón de integración recomendado
- protocolo principal
- si requiere gateway
- si soporta alta precisión
- si requiere SDK propietario
- si requiere credenciales

# Architecture v1 runtime gate

## Purpose

This gate validates the running local stack for the v1 architecture skeleton.

It should be executed only after the local stack is already running.

## Start stack

pnpm dev:stack:windows

Expected runtime services:

- Cloud API: http://localhost:8788
- Edge API: http://localhost:8787
- Web cockpit: Vite local URL

## Command

pnpm architecture:runtime

## What it checks

The runtime gate validates:

- Cloud API /health
- Edge /health
- Cloud API /sync/status
- Edge /sync/packages/db-projection
- pnpm api:smoke
- pnpm demo:smoke
- pnpm sync:smoke
- pnpm smoke:runtime

## Optional direct command

powershell -NoProfile -ExecutionPolicy Bypass -File scripts/architecture-v1-runtime-gate.ps1

## Meaning

If this command passes, the local stack is runtime-ready for demo.

Status:

V1_RUNTIME_READY_FOR_DEMO

## Difference from architecture:gate

pnpm architecture:gate validates repository consistency without requiring running servers.

pnpm architecture:runtime validates the live local stack.
# Phase 2 demo runtime smoke

## Purpose

This smoke validates that the running local stack supports the Phase 2 cockpit demo panels.

## Start stack

pnpm dev:stack:windows

## Command

pnpm phase2:runtime

## What it validates

- Cloud API health
- Edge health
- optional Cloud API demo reset
- Cloud API stockpiles
- Cloud API audit mutations
- Cloud API sync status
- Edge DB projection sync export
- Cloud API sync preview
- Cloud API sync ingest apply blocked

## Optional skip reset

pnpm phase2:runtime -- -SkipReset

## Meaning

If this passes, the live local stack supports the Phase 2 cockpit demo flow.

Status:

PHASE_2_DEMO_RUNTIME_READY
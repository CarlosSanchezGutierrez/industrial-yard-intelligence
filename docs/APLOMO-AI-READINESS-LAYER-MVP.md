# Aplomo AI Readiness Layer MVP

## Goal

Prepare governed, auditable context packets for future AI, LLM and agentic workflows.

## Route

/aplomo-admin

## Table

public.aplomo_ai_readiness_packets

## What it enables

- governed AI context packets
- prompt context previews
- customer success context
- support triage context
- operations summary context
- data readiness context
- investor summary context
- model-family allowlists
- sensitivity labels
- redaction notes
- human approval workflow

## What it intentionally does not do yet

It does not call OpenAI, Gemini, Claude or any other external model.

This is intentional.

First we need:

- data governance
- auditability
- human review
- sensitivity classification
- redaction discipline
- customer-level context boundaries

## Who can read

- aplomo_owner
- aplomo_admin
- aplomo_support
- aplomo_viewer

## Who can insert

- aplomo_owner
- aplomo_admin
- aplomo_support

## Who can approve/update

- aplomo_owner
- aplomo_admin

## Files

- supabase/migrations/20260430000900_aplomo_ai_readiness_packets.sql
- apps/web/src/integrations/aplomoAiReadinessRepository.ts
- apps/web/src/internal/AplomoAiReadinessPanel.tsx

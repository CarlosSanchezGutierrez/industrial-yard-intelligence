# AI Governance Audit + Prompt Registry MVP

## Goal

Create versioned AI prompt governance before connecting external LLM providers.

## Route

/aplomo-admin

## Tables

- public.aplomo_ai_prompt_registry
- public.aplomo_ai_governance_events

## What it enables

- prompt registry
- prompt versioning
- prompt approval
- prompt deprecation
- model family allowlists
- sensitivity classification
- surface classification
- governance tags
- audit events
- risk flags
- manual governance notes

## Why it matters

Before Aplomo connects OpenAI, Gemini, Claude or agents, prompts need governance.

This avoids uncontrolled prompt sprawl, unsafe data exposure and unaudited automation.

## Who can read

- aplomo_owner
- aplomo_admin
- aplomo_support
- aplomo_viewer

## Who can create

- aplomo_owner
- aplomo_admin
- aplomo_support

## Who can approve/update prompts

- aplomo_owner
- aplomo_admin

## Files

- supabase/migrations/20260430001000_aplomo_ai_governance_prompt_registry.sql
- apps/web/src/integrations/aplomoAiGovernanceRepository.ts
- apps/web/src/internal/AplomoAiGovernancePromptRegistryPanel.tsx

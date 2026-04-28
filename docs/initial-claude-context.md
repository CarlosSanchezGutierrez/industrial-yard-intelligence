# Initial Claude Code Context

Use this file as persistent context for AI-assisted development sessions.

## Required Behavior

Before implementing, the assistant must understand the project, inspect the repository, identify uncertainties, and propose the smallest correct next step.

Do not implement large chunks without approval.

Do not assume unconfirmed technologies or business facts.

Do not hardcode Cooper/T. Smith operational data into UI components.

Do not treat this product as a throwaway demo.

## First Session Instruction

When starting a new Claude Code session, read these files first:

- README.md
- docs/project-context.md
- docs/working-methodology.md
- docs/architecture-principles.md
- docs/domain-glossary.md

Then respond with:

1. Current understanding of the product.
2. Current repository status.
3. Technical decisions still open.
4. Risks.
5. Recommended smallest next step.

Do not modify files until explicitly approved.

## Strategic North Star

Build the system as a real industrial SaaS platform:

- local-first
- offline-capable
- multi-tenant ready
- GIS-ready
- event-driven
- evidence-backed
- auditable
- configurable
- prepared for professional measurement workflows
- prepared for future analytics and optimization

## Initial Technical Bias

Potential stack:

- React + TypeScript
- Vite
- Tailwind CSS
- MapLibre GL
- Capacitor
- Node.js + TypeScript
- PostgreSQL + PostGIS
- SQLite
- GeoJSON

These are strong candidates but must be justified before implementation.

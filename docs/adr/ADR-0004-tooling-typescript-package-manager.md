# ADR-0004 - Tooling / TypeScript / Package Manager

**Status:** Proposed  
**Date:** 2026-04-28  
**Authors:** Carlos Sanchez Gutierrez  
**Deciders:** Carlos Sanchez Gutierrez  

---

## Context

Industrial Yard Intelligence is being designed as a local-first, offline-first industrial SaaS platform with cloud, edge, web, mobile, sync, spatial, audit, evidence and future measurement workflows.

ADR-0001 established trust boundaries.

ADR-0002 established the monorepo strategy.

ADR-0003 established the tenant isolation strategy.

Before creating the first code package, the repository needs a minimal and disciplined tooling foundation.

This ADR defines the initial package manager, workspace approach, TypeScript posture, linting, formatting and testing baseline.

This ADR does not decide application frameworks, backend frameworks, frontend frameworks, ORM, database schema, mobile shell, map engine or deployment infrastructure.

---

## Decision

Use a minimal TypeScript-first pnpm workspace setup.

Initial decisions:

- Package manager: pnpm.
- Workspace strategy: pnpm workspaces.
- Language: TypeScript.
- TypeScript mode: strict.
- Runtime target: current Node.js LTS.
- Formatting: Prettier.
- Linting: ESLint.
- Testing: Vitest.
- Build orchestration: simple package scripts at first.
- Monorepo orchestrator: deferred.
- Frameworks: deferred.

The first scaffold must remain minimal and should not create full applications.

---

## Rationale

### Why pnpm

pnpm is a strong fit because:

- It supports workspaces natively.
- It is efficient with disk space.
- It enforces stricter dependency boundaries than npm in many cases.
- It works well for TypeScript monorepos.
- It keeps local development lightweight.

The repository will eventually contain multiple apps and shared packages. pnpm is appropriate for this shape without requiring heavier tooling immediately.

### Why TypeScript strict

The platform depends on shared concepts such as:

- TenantId.
- EntityId.
- DeviceId.
- UserId.
- ValidationState.
- ConfidenceLevel.
- MeasurementSource.
- DomainEvent.
- Sync envelopes.
- Audit metadata.
- Evidence metadata.
- Spatial primitives.

Weak typing would allow incorrect domain assumptions to spread across cloud, edge, mobile and web.

TypeScript strict mode is required from the first package.

### Why not npm

npm is simpler but less ideal for disciplined workspace boundaries in a growing monorepo.

### Why not yarn

Yarn is viable, but pnpm has a better default fit for a modern TypeScript workspace and simpler dependency discipline.

### Why no Turborepo or Nx yet

A monorepo orchestrator may become useful later, but it is not needed before there are multiple real packages with expensive builds.

Adding one too early creates unnecessary complexity.

Initial scripts can be simple.

### Why Vitest

Vitest is a good initial testing tool for TypeScript packages because:

- It is fast.
- It works well with Vite if the frontend later uses Vite.
- It is simple enough for early domain and kernel tests.
- It supports TypeScript workflows well.

### Why Prettier and ESLint

Prettier handles formatting.

ESLint handles code correctness, TypeScript rules and project conventions.

Both are standard baseline tools for a TypeScript project.

---

## Initial Tooling Scope

The first scaffold may create:

- package.json
- pnpm-workspace.yaml
- tsconfig.base.json
- .editorconfig
- .nvmrc
- .prettierrc
- eslint.config.js or eslint.config.mjs
- vitest.config.ts if needed once the first package exists
- apps directory placeholder if needed
- packages directory placeholder if needed
- tooling directory placeholder if needed

The first scaffold must not create:

- React app
- Fastify app
- NestJS app
- Capacitor app
- PostGIS schema
- ORM setup
- Docker Compose
- CI/CD
- MapLibre implementation
- authentication
- sync engine
- database migrations

---

## Node Version

Use the current Node.js LTS as the target runtime.

The exact version should be encoded in `.nvmrc`.

If the local development machine uses a newer compatible version, the repository should still document the intended LTS baseline.

The project should avoid experimental Node.js features unless explicitly approved in a future ADR.

---

## Package Scripts

Root scripts should start minimal.

Expected initial scripts:

- `typecheck`
- `lint`
- `format`
- `format:check`
- `test`

Build scripts should be added only when there are packages that need building.

No script should hide complex behavior during the first scaffold.

---

## TypeScript Configuration

`tsconfig.base.json` should establish:

- strict mode
- no implicit any
- no unchecked indexed access if practical
- exact optional property types if practical
- module resolution appropriate for modern Node and bundlers
- declaration output for packages when needed
- shared compiler baseline for all packages

Each package can later extend the base config.

---

## Linting Strategy

Initial ESLint rules should enforce:

- TypeScript correctness
- no unused variables unless intentionally prefixed
- no explicit any unless justified
- consistent imports where practical
- no implicit unsafe patterns

Rules should start strict enough to protect the codebase but not so strict that they block early development with noise.

---

## Formatting Strategy

Prettier should define the formatting baseline.

Formatting decisions are not product architecture decisions.

The purpose is consistency, not debate.

---

## Testing Strategy

Initial tests should focus on packages/kernel and later packages/domain.

Tests should validate:

- value object creation
- tenant-aware metadata
- validation state transitions
- confidence level rules
- event invariants
- sync protocol primitives once ADR-0005 exists

No frontend or backend test framework is chosen yet.

---

## Dependency Policy

Dependencies must be added intentionally.

Before adding a dependency, the developer or AI assistant should identify:

- what problem it solves
- why native language features are not enough
- why the dependency is stable enough
- whether it will be used by runtime code or dev tooling
- whether it affects edge, mobile, web or cloud compatibility

Do not add dependencies just because they are common.

---

## AI Agent Policy

AI coding agents must not install dependencies or initialize frameworks unless explicitly approved.

For this repository, agents should:

1. read ADRs before implementation
2. propose a small step
3. explain tooling changes
4. wait for approval for dependency additions
5. avoid generating large scaffolds
6. keep changes reviewable

PowerShell should be used for mechanical repository operations when possible.

---

## Out of Scope

This ADR does not decide:

- React vs alternative frontend framework
- Fastify vs NestJS
- Drizzle vs Prisma vs Kysely
- PostgreSQL/PostGIS schema
- Docker setup
- Capacitor setup
- mobile SQLite plugin
- map engine
- sync protocol design
- authentication implementation
- authorization implementation
- CI/CD provider
- deployment strategy
- cloud provider
- package publishing strategy

---

## Positive Consequences

- Establishes a disciplined TypeScript workspace foundation.
- Enables shared packages without committing to full applications.
- Prevents framework lock-in too early.
- Keeps initial setup lightweight.
- Supports future monorepo growth.
- Makes the first code package easier to typecheck and test.
- Makes AI-generated code easier to constrain and review.

---

## Negative Consequences

- Does not yet produce visible product UI.
- Requires developers to understand pnpm workspaces.
- Requires TypeScript discipline from the start.
- Some tooling decisions may need refinement once apps exist.
- Defers framework decisions, which may feel slower.

---

## Risks

- Tooling becomes more complex than the product at this stage.
- pnpm workspace setup may be misconfigured.
- Strict TypeScript settings may slow early coding.
- ESLint rules may become noisy.
- Future app frameworks may require config adjustments.

Mitigations:

- Keep scaffold minimal.
- Add rules incrementally.
- Avoid monorepo orchestrators at first.
- Add framework-specific tooling only when apps are created.
- Keep package boundaries explicit.

---

## Decisions Conditioned by this ADR

### Minimal Scaffold

After this ADR is accepted, the repository may create the minimal monorepo scaffold.

### packages/kernel

The first code package should be packages/kernel.

### ADR-0005

Sync protocol decisions should assume TypeScript strict types and pnpm workspace package boundaries.

### Future Frontend ADR

Frontend tooling may extend the base TypeScript and lint configuration.

### Future Backend ADR

Backend tooling may extend the base TypeScript and lint configuration.

### Future Mobile ADR

Mobile tooling may extend the base TypeScript and lint configuration.

---

## Criteria for Future Revision

This ADR should be reviewed if:

- pnpm becomes a blocker for the team.
- the repository requires a monorepo orchestrator.
- build times become slow.
- frontend or backend frameworks require incompatible tooling.
- mobile development requires a significantly different package strategy.
- TypeScript strictness causes unacceptable friction.

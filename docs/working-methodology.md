# Working Methodology

## Core Rule

Build the system with the mindset of creating the perfect future system in the present, but execute it step by step.

Do not build disposable demo code.

Do not overengineer prematurely.

Every change must move the repository toward a real, scalable, maintainable industrial SaaS product.

## Development Discipline

Before any meaningful implementation:

1. Understand the objective.
2. Inspect the current repository state.
3. Identify constraints.
4. Identify assumptions.
5. Identify risks.
6. Propose the smallest correct step.
7. Ask for approval when the decision affects architecture, stack, data model, sync, security, or core product direction.
8. Implement only the approved scope.
9. Verify.
10. Summarize the result and next step.

## No Assumptions Policy

Do not assume unknown business facts, field dimensions, real coordinates, confirmed equipment locations, confirmed yard boundaries, or operational rules.

Classify uncertain information as one of:

- confirmed
- not_confirmed
- pending
- simulated
- configurable
- technical_decision_required
- business_decision_required
- future_integration

If unconfirmed data is required to move forward, mark it clearly as:

- ASSUMPTION
- TODO
- SIMULATED_DATA
- CONFIGURABLE
- FUTURE_INTEGRATION

## Code Quality Rules

- Prefer TypeScript strict mode when using TypeScript.
- Avoid any unless explicitly justified.
- Keep domain logic out of UI components.
- Keep business rules configurable where possible.
- Keep industrial seed data outside UI components.
- Use English for code-level entities and identifiers.
- UI text may be Spanish.
- Prefer small modules over large files.
- Prefer clear domain models over clever abstractions.
- Do not introduce dependencies without a reason.
- Document non-obvious architectural decisions.

## Configuration Over Hardcoding

Configurable:

- organizations
- terminals
- yards
- zones
- materials
- equipment
- infrastructure
- rules
- recommendations
- scenarios
- KPIs
- layers
- views
- branding
- roles
- permissions
- units
- states
- movement types
- measurement sources
- confidence levels

Core engine concepts may be hardcoded only when they represent stable platform primitives:

- authentication foundation
- event engine
- spatial engine
- sync engine
- rules engine
- audit model
- validation workflow core

## AI Assistant Usage Policy

AI coding agents must not be asked to build the entire product at once.

Preferred workflow:

1. Ask for understanding.
2. Ask for repository inspection.
3. Ask for a plan.
4. Approve a small task.
5. Let the agent implement only that task.
6. Review diff.
7. Commit.
8. Continue.

Claude Code should be treated as a senior implementation agent, not as an uncontrolled generator.

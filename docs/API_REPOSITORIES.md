# API Repository Layer

apps/api now has its first repository-backed application layer.

Current implementation:

createApiRepositorySeed
Creates Cooper/T. Smith seed records using DB record contracts.

createApiUnitOfWork
Creates an in-memory DbUnitOfWork seeded with tenants, terminals, users, devices and stockpiles.

This is not final persistence.

Next persistence step:

1. Keep route contracts stable.
2. Replace in-memory unit of work with JSON or Postgres-backed implementation.
3. Add auth and tenant scoping.
4. Add write endpoints only after read model is stable.
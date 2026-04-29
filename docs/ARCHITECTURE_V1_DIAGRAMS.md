# Architecture v1 diagrams

This document contains Mermaid diagrams for the Industrial Yard Intelligence / Modelo Namiki architecture skeleton.

## 1. System context

Mermaid source:

flowchart LR
    operator[Operator / Yard crew]
    supervisor[Supervisor / Admin]
    cockpit[apps/web<br/>Supervisor cockpit]
    edge[apps/edge<br/>Local-first edge runtime]
    api[apps/api<br/>Cloud API skeleton]
    db[(packages/db<br/>Shared DB model)]
    contracts[packages/api-contracts<br/>Shared HTTP contracts]
    domain[packages/domain<br/>Business rules]
    jsonEdge[(.edge-data<br/>Local edge data)]
    jsonApi[(.api-data<br/>Cloud API JSON data)]

    operator --> edge
    supervisor --> cockpit
    cockpit --> edge
    cockpit --> api
    edge --> jsonEdge
    api --> jsonApi
    edge --> contracts
    api --> contracts
    cockpit --> contracts
    api --> domain
    cockpit --> domain
    edge --> db
    api --> db

## 2. Package boundaries

Mermaid source:

flowchart TB
    subgraph Apps
        web[apps/web]
        api[apps/api]
        edge[apps/edge]
    end

    subgraph Shared packages
        db[packages/db]
        contracts[packages/api-contracts]
        domain[packages/domain]
        seed[packages/seed-data]
        audit[packages/audit]
        media[packages/media]
        spatial[packages/spatial]
        syncCore[packages/sync-core]
        syncProtocol[packages/sync-protocol]
    end

    web --> contracts
    web --> domain
    api --> contracts
    api --> domain
    api --> db
    api --> seed
    edge --> contracts
    edge --> db
    edge --> seed
    edge --> audit
    edge --> media
    edge --> spatial
    edge --> syncCore
    edge --> syncProtocol

## 3. Stockpile lifecycle flow

Mermaid source:

stateDiagram-v2
    [*] --> draft
    draft --> operational
    draft --> pending_review
    draft --> validated
    draft --> archived

    operational --> pending_review
    operational --> validated
    operational --> archived

    pending_review --> operational
    pending_review --> validated
    pending_review --> archived

    validated --> pending_review
    validated --> archived

    archived --> [*]

## 4. Cloud API mutation audit flow

Mermaid source:

sequenceDiagram
    participant Web as apps/web
    participant API as apps/api
    participant Domain as packages/domain
    participant Store as JSON DB store
    participant Audit as audit_entries

    Web->>API: POST /stockpiles
    API->>Domain: validate lifecycle/status rules
    API->>Store: persist stockpile
    API->>Audit: append stockpile.created
    API-->>Web: created stockpile

    Web->>API: PATCH /stockpiles/:id/status
    API->>Domain: validate transition
    API->>Store: persist new status
    API->>Audit: append stockpile.status_updated
    API-->>Web: updated stockpile

    Web->>API: GET /audit/mutations
    API->>Audit: read mutation entries
    API-->>Web: audit timeline

## 5. Edge-to-cloud sync skeleton

Mermaid source:

sequenceDiagram
    participant Edge as apps/edge
    participant API as apps/api
    participant Web as apps/web
    participant Contracts as packages/api-contracts

    Web->>Edge: GET /sync/packages/db-projection
    Edge->>Edge: read /db/snapshot internally
    Edge->>Contracts: create CloudEdgeSyncPackageContract
    Edge-->>Web: db_projection_snapshot package

    Web->>API: GET /sync/status
    API-->>Web: sync capabilities

    Web->>API: POST /sync/preview
    API->>Contracts: validate package shape
    API-->>Web: accepted preview result

    Web->>API: POST /sync/ingest apply
    API-->>Web: accepted false, apply disabled safely

## 6. Local runtime ports

Mermaid source:

flowchart LR
    browser[Browser]
    web[apps/web<br/>Vite]
    api[apps/api<br/>localhost:8788]
    edge[apps/edge<br/>localhost:8787]
    apiData[(.api-data/api-db.json)]
    edgeData[(.edge-data)]

    browser --> web
    web --> api
    web --> edge
    api --> apiData
    edge --> edgeData

## 7. Architecture v1 readiness gate

Mermaid source:

flowchart TD
    start[Start architecture readiness]
    check[architecture:check]
    build[Package builds]
    tests[Package tests]
    typecheck[Root typecheck]
    rootTest[Root tests]
    ci[ci-local]
    smokeApi[api:smoke]
    smokeEdge[demo:smoke]
    smokeSync[sync:smoke]
    ready[v1 skeleton ready]

    start --> check
    check --> build
    build --> tests
    tests --> typecheck
    typecheck --> rootTest
    rootTest --> ci
    ci --> smokeApi
    smokeApi --> smokeEdge
    smokeEdge --> smokeSync
    smokeSync --> ready
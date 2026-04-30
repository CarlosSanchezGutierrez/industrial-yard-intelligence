# SaaS Access Model Foundation

## Current state

The product has a temporary internal console enabled with:

?aplomoInternal=1

That console is useful for development, validation and demos. It is not the final customer portal.

## Required SaaS surfaces

1. Aplomo Super Admin
   Used by Aplomo owners, admins and support.
   Can see cross-tenant operational health, companies, support data and platform diagnostics.

2. Tenant Admin
   Used by customer company admins.
   Can manage only their company: users, roles, devices, sites, materials, stockpiles and settings.

3. Tenant Operations
   Used by managers and supervisors.
   Can monitor operations, alerts, scores, maps, devices and plant/site performance.

4. Tenant Capture
   Used by operators, capturists, machine operators and field staff.
   Can capture GPS points and evidence for assigned work.

5. Tenant Data Hub
   Used by analysts, data engineers and data scientists.
   Can use exports, data products, connectors, BI and AI-ready datasets depending on permission.

6. Internal Dev Tools
   Used only by Aplomo during development and controlled rollout.

## Main rule

A customer must never see another customer's data.

A low-rank operator must never see admin or data engineering tools.

Aplomo platform users may have cross-tenant access only through platform roles and audited tools.

## Role layers

There are two role layers:

- platform_role on aplomo_profiles
- tenant role on aplomo_company_memberships

Platform roles:

- none
- aplomo_owner
- aplomo_admin
- aplomo_support
- aplomo_viewer

Tenant roles:

- tenant_owner
- tenant_admin
- operations_manager
- site_supervisor
- capture_operator
- machine_operator
- analyst
- data_engineer
- data_scientist
- viewer

## Files added

- packages/domain/src/aplomoSaasAccessModel.ts
- packages/api-contracts/src/aplomoSaasAccessContracts.ts
- supabase/migrations/20260430000400_aplomo_saas_access_model.sql

## What this enables next

- Customer admin panel.
- User management per company.
- Role-based UI.
- Permission-based exports.
- Separate Aplomo internal console.
- Safer RLS helpers.
- Employee performance analytics.
- Site and plant performance dashboards.
- Controlled access for operators, supervisors, analysts and data scientists.

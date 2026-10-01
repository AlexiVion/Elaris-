# Elaris Platform — Horizontal v0

## Purpose

Demonstrate one architectural claim without changing the existing Humandroid / Deployment Control product:

> **One shared infrastructure can support distinct products for distinct Physical AI actors.**

## Frozen reference

The current Deployment Control implementation remains the reference product for:

**Robotics Integrator / Solution Provider / Deployer**

Humandroid is the first reference customer/use case.

Horizontal work must not mutate Deployment Control simply to satisfy another actor.

Allowed changes to the reference product remain:
- real Humandroid-validated workflow improvements;
- bug fixes;
- security/data fixes.

## Horizontal v0 surface

New route:

`/platform`

It provides a separate Elaris Platform shell and product registry.

Products in v0:

1. Deployment Control — Integrator / Deployer — LIVE
2. Operational Readiness — Enterprise Buyer / Operator — PROTOTYPE
3. Safety Change Control — Safety / EHS — PROTOTYPE
4. Broker Workspace — Insurance Broker — PROTOTYPE
5. Underwriting Workspace — Insurer / MGA — PROTOTYPE
6. Incident Reconstruction — Claims / Forensics — PROTOTYPE

## Shared substrate

The prototypes reuse the current data model:

Organization
→ Robot
→ ConfigurationSnapshot
→ Deployment
→ Evidence / Requirement
→ Approval
→ Change
→ Incident
→ Audit

No generic all-actor CRUD is introduced in Horizontal v0.

## Architectural rule

Actor-specific products own their:
- navigation;
- workflow;
- decision lens;
- permissions;
- reports;
- future write operations.

The shared substrate owns common identifiers, relationships, provenance and historical truth.

## Product boundary

Horizontal v0 is a product-architecture prototype.

It does **not** claim that:
- broker workflow is validated;
- underwriting workflow is validated;
- safety workflow is complete;
- claims workflow is complete;
- the same fields are sufficient for every actor.

Those views exist to test the platform thesis visually using the same underlying deployment data.

## Next validation

For each actor archetype:

1. identify a real organization/person;
2. document their real decision;
3. document required inputs;
4. document current outputs;
5. show the prototype;
6. record where the proposed view is wrong;
7. only then create actor-specific write workflows or schema extensions.

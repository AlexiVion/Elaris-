# Operational Readiness — Visual Audit & Real Mockup Direction

## Audit conclusion

The Wave A concept is correct.

The existing three screens successfully establish the core buyer-side idea:

- one exact deployment/configuration;
- requirements and evidence;
- cross-functional acceptance gates;
- material changes that can reopen review;
- human acceptance authority.

However, the current version still reads as a discovery prototype rather than a believable day-to-day product.

## What already works

### 1. The primary object is correct
The buyer should evaluate a **deployment**, not a generic robot model.

### 2. Acceptance Gates are the strongest concept
Procurement / Customer, Safety / EHS, IT / Cyber and Operations give the buyer a concrete coordination model.

### 3. Configuration truth is useful
Showing the exact baseline/configuration is meaningfully different from a conventional vendor questionnaire.

### 4. Change monitoring closes the lifecycle
The product is not only pre-deployment due diligence; it can preserve acceptance after material changes.

## What makes the current UI feel like a prototype

1. Only one deployment is visible as a product experience.
2. There is no real portfolio/list page.
3. There is no operational review queue with owners, due dates and categories.
4. Acceptance is shown as a static concept rather than a lifecycle/decision record.
5. No dedicated Changes surface exists for the buyer.
6. No output/report surface exists for the buyer.
7. “Prototype hypothesis” messaging dominates the UI.
8. Navigation is too small for a believable operational product.
9. The buyer role/context is not visible.
10. Actions are mostly links rather than work-oriented controls.

## Real mockup information architecture

### Overview
Portfolio health + urgent work + current acceptance status.

### Deployments
Buyer portfolio of candidate/live deployments.

### Review Queue
All missing evidence, review items, pending decisions and material changes.

### Deployment Review
Exact system/configuration + requirements + evidence + acceptance context.

### Acceptance Gates
Cross-functional gate lifecycle + conditions + named authority + decision record.

### Changes
Material changes since accepted baseline and which gates may need reopening.

### Reports
Buyer-facing outputs:
- Deployment Due Diligence Pack
- Acceptance Record
- Change Since Acceptance Brief

## Important boundary

This remains a **visual product mockup**.

Do not add:
- AcceptanceGate Prisma model;
- buyer-specific write API;
- new auth model;
- standards engine;
- generic CRUD.

The mockup can use presentation-only buyer objects as long as they are visibly demo data and derive from real shared Elaris records where possible.

## Product thesis being tested

> An enterprise buyer/operator can use the same versioned deployment truth as the integrator, but through a completely different workflow centered on acceptance, cross-functional gates and changes since acceptance.

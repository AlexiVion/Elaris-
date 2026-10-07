# Elaris Product Systems

## Why this exists

Elaris is not one application with an ever-growing list of features.

Elaris is a **platform with shared Physical AI truth** that can support multiple independent product systems for different actors.

The operating model is:

```text
ELARIS PLATFORM
Shared identities + versioned technical truth + provenance
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Product System   Product System   Product System
        │                │                │
      Actor            Actor            Actor
        │                │                │
   concrete job     concrete job     concrete job
        │                │                │
  process + AI      process + AI      process + AI
        │                │                │
 human decision     human decision     human decision
        │                │                │
      output           output           output
```

## Core distinction

> **Platform ≠ Product ≠ Feature**

### Platform

The platform owns shared infrastructure and historical truth:

- Organization
- Robot
- ConfigurationSnapshot / ConfigItem
- Deployment / task / site
- Baseline
- Evidence / Requirement
- Approval
- Change / ImpactItem
- Incident
- Audit / Share
- common identity, provenance and version relationships

### Product System

A Product System solves one important recurring job for one primary actor.

A Product System must define:

```text
Actor
→ Problem / decision
→ Trigger
→ Inputs
→ Process
→ AI / deterministic logic
→ Human authority
→ Output
→ Feedback / new data
```

A product should be understandable, demonstrable and eventually purchasable on its own.

### Feature

A feature is a capability inside a Product System.

Example:

```text
Component Health
├── Component registry
├── Usage history
├── Degradation signals
├── Anomaly detection
├── Inspection alerts
└── Maintenance recommendation
```

Those are features of a product system. They are not separate products by default.

---

## Relationship with canonical portfolio planning

The canonical Elaris portfolio/product planning lives in GitHub under `docs/portfolio/` and `docs/product/<slug>/`.

Raw discovery/interview notes may live in Notion, but they do not change accepted product scope until the resulting decision is promoted into the versioned GitHub planning docs.

Demo Product Specs remain discovery instruments before validation.

Product Systems add one level above that:

```text
Product System thesis
        ↓
Product System definition
        ↓
Demo Product Spec
        ↓
Full realistic demo
        ↓
Real actor interview
        ↓
Real artifacts
        ↓
Corrected / validated workflow
        ↓
Persist/integrate only what repeats
        ↓
Pilot
        ↓
Paid product
```

A Product System can exist as a **hypothesis** before a demo exists.

A demo can exist before the workflow is **validated**.

Do not confuse visual completeness with market validation.

---

## Product System lifecycle

Use these statuses:

### HYPOTHESIS
A plausible problem/product thesis. Not validated with a real actor.

### SPECIFIED
Actor, decision, workflow, inputs and outputs have been defined well enough to build a demo.

### CONCEPT PROTOTYPE
A partial visual workflow exists, but it is below the full-demo threshold.

### DEMO READY
A full realistic actor application exists and can support an end-to-end discovery meeting.

### PILOT
A real organization is using/providing real workflow data or artifacts.

### VALIDATED
Repeated field evidence supports the workflow and economic value.

### PAID
A customer is paying for the product.

These statuses describe **product evidence**, not engineering quality.

---

## AI rule

A Product System does not need its own foundation model.

Its AI architecture can use:
- external LLMs;
- vision models;
- speech models;
- classical ML;
- anomaly detection;
- forecasting;
- retrieval;
- deterministic rules;
- no AI at all.

The Product System must say what the AI does and what it **does not decide**.

Human authority remains explicit for safety, certification/conformity, underwriting, coverage, legal causation and formal approval decisions.

---

## Registry and planning packs

See:
- [Product Systems Registry](registry.md)
- [Portfolio Planning System](../portfolio/README.md)
- [Product × Actor Matrix](../portfolio/product-actor-matrix.md)

Every registered product now has a canonical pack under `docs/product/<slug>/`:
- `README.md`
- `roadmap.md`
- `version-registry.md`
- `execution-backlog.md`

Use [Product System Template](product-system-template.md) before proposing Product System #15 or changing a product boundary.

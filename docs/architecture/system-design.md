# Elaris — Current System Design & Humandroid Audit

## Audit conclusion

The existing repository is **not a throwaway prototype**. It already implements most of the core Deployment Control concept.

The correct strategy is:

> **adapt the current MVP to a real Humandroid workflow, not rewrite it.**

## What already exists

### Product objects
- Robot
- ConfigurationSnapshot / ConfigItem
- Deployment
- Baseline
- EvidenceItem / Requirement category
- Approval
- Change
- ImpactItem
- Incident
- ShareLink
- AuditEvent

### Product screens
- Home
- Robots
- Deployments
- Evidence
- Requirements
- Changes
- Incidents
- Reports
- Search
- Share View

### Core engine
`lib/engine/` already contains pure deterministic logic for:
- configuration hashing;
- before/after diff;
- impact rules;
- readiness;
- evidence coverage.

### Existing golden scenario
The repo already models:

**Unitree G1 · BrainCo Revo2 → Inspire RH56DFX · control-stack change**

with deterministic impact items and tests.

That scenario is highly aligned with the Humandroid pilot hypothesis.

## Important correction from the initial high-level audit

Configuration is **already** a first-class concept through `ConfigurationSnapshot + ConfigItem`.
We do not need to invent a new mutable Configuration entity.

This design is actually preferable for the pilot because it preserves historical truth.

## Gaps to validate before code changes

### 1. Real-data intake
The app has demo data but no defined onboarding flow for messy real Humandroid artifacts.

Pilot response: keep onboarding manual first; document repeated steps before automating.

### 2. Provenance depth
Current models have source/owner/URI/hash/timestamps, but the pilot may reveal a need for explicit external source IDs, confirmation state or validity windows.

Do not add these yet.

### 3. Requirement abstraction
Requirements currently share the EvidenceItem table using `category = REQUIREMENT`.

This may be enough. Validate with real data before splitting the schema.

### 4. Actor-specific interfaces
Reports/share views exist, but the exact customer/safety workflow has not been validated with Humandroid.

### 5. AI/document extraction
Not implemented. That is acceptable: the first pilot can be human + AI-assisted outside the deterministic core.

### 6. Integrations

The repository now includes a bounded **read-only robotics acquisition path** for validation work:

~~~text
authorized robot / replay source
        ↓
Robot Adapter V0
        ↓
Edge Collector V0
        ↓
encrypted local capture
        ↓
human review / explicit export approval
~~~

The first concrete adapter targets Unitree G1 public SDK2 state structures.

This does **not** mean production robot integration is validated. The physical Siglo 21 G1 connection, actual DDS discovery and real `rt/lowstate` capture remain pending.

There is still no general Git/Drive/fleet integration and no production Humandroid ROS2/TienKung adapter.

Integrate additional sources only after identifying which source creates repeated manual work or supplies evidence needed for a validated Product System.

See:

- `docs/architecture/robot-adapter-v0.md`
- `docs/architecture/edge-collector-v0.md`
- `docs/architecture/robot-execution-context-v0.md`
- `docs/pilots/siglo21/robotics-integration-v0-record.md`

## Architecture to preserve

```
External sources
      ↓
manual/assisted intake
      │
      ├── robot state path (when authorized)
      │     Robot Adapter
      │          ↓
      │     Edge Collector
      │          ↓
      │     encrypted local evidence
      ↓
ConfigurationSnapshot + Deployment
      ↓
Evidence / Requirement / Approval links
      ↓
Baseline
      ↓
Change
      ↓
pure deterministic impact engine
      ↓
Human review
      ↓
new baseline + reports/share
```

## MVP modification policy

Before changing code, every proposed feature must answer:

1. Which Humandroid workflow step does this serve?
2. Which real input triggers it?
3. Which user decision/output does it improve?
4. What evidence from the pilot justifies building it?
5. Can it remain manual for the first iteration?

If those questions cannot be answered, the feature stays out.

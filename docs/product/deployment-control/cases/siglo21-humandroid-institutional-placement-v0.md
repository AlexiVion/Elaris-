# Deployment Control — Siglo 21 / Humandroid Institutional Placement V0

**Case ID:** `DC-CASE-S21-HMND-001`  
**Evidence class:** `HUMAN_CONFIRMED_CONTEXT + EXISTING_FIELD_EVIDENCE_REFERENCES`  
**Planning status:** `SELECTED_FOR_V0.5`  
**Production deployment:** `NO`

## 1. Why this is the V0.5 case

The Unitree G1 used by Elaris at Universidad Siglo 21 is a Humandroid robot physically hosted at Universidad Siglo 21 under an institutional agreement between the organizations.

It is **not deployed to perform a specific production task** and must not be represented as a fictional commercial customer deployment.

This makes it a useful real-world test of whether Deployment Control models reality rather than only the original commercial demo scenario.

## 2. Facts that may be treated as current context

- Robot family: Unitree G1.
- Robot relationship: Humandroid robot.
- Host institution/site: Universidad Siglo 21.
- Relationship: institutional agreement / convenio between Humandroid and Universidad Siglo 21.
- Physical placement exists.
- No specific production task is assigned to the robot.
- No commercial-customer relationship should be inferred from the placement.
- Elaris has already performed authorized read-only field-evidence work on this physical robot; private evidence/data approval boundaries remain unchanged.

## 3. Unknowns that must remain unknown until evidenced

Do not invent:
- commercial customer;
- production task;
- contractual purpose beyond the confirmed institutional relationship;
- site acceptance decision;
- production operating limits;
- customer engineering approval;
- safety certification;
- exact agreement terms;
- asset ownership legal wording beyond the current human-confirmed “Humandroid robot” context;
- continuous operational status outside observed sessions.

## 4. Current schema mismatch

Current Prisma domain requires:

```text
Deployment
├── customerId   REQUIRED
├── siteId       REQUIRED
├── taskId       REQUIRED
├── lifecycle    REQUIRED
├── operatingMode REQUIRED
└── humanExposure REQUIRED

Site
└── customerId   REQUIRED
```

Using that model directly would force Elaris to mislabel Universidad Siglo 21 as a commercial `Customer` and invent a `Task`.

That is a real domain-model gap discovered by V0.5.

## 5. Required conceptual separation

A deployment/placement context must distinguish:

```text
ASSET / ROBOT IDENTITY
        │
        ├── owner/provider organization
        │
        ▼
PHYSICAL PLACEMENT
        │
        ├── host organization
        ├── site
        ├── relationship / agreement context
        └── placement purpose/context
        │
        ▼
OPTIONAL OPERATIONAL ASSIGNMENT
        │
        ├── task (0..n)
        ├── operating mode
        ├── human exposure
        └── operational constraints
        │
        ▼
OPTIONAL COMMERCIAL CONTEXT
             └── customer / contract / buyer
```

None of those optional contexts may be inferred from the others.

## 6. Candidate domain direction — not yet approved schema

V0.5 should evaluate a generalized context such as:

```text
Deployment / Placement
├── robot(s)
├── providerOrganization
├── hostOrganization
├── site
├── contextKind
├── relationshipRef?
├── purpose/description
├── operationalState
├── task?                 OPTIONAL
├── customer?             OPTIONAL
├── operatingMode?        OPTIONAL until applicable
├── humanExposure?        OPTIONAL until applicable
└── activeBaseline?
```

Candidate `contextKind` values to test against real cases:

- `INSTITUTIONAL_PLACEMENT`
- `INTERNAL_LAB`
- `TEST`
- `PILOT`
- `DEMO`
- `PRODUCTION`

The final taxonomy must be driven by real cases, not this first proposal.

## 7. V0.5 reconciliation outputs

The case should produce:

1. **Robot identity record**
   - only facts supported by existing field evidence / authorized Humandroid input.

2. **Organization relationship**
   - Humandroid;
   - Universidad Siglo 21;
   - host/provider relationship without fabricating a customer relationship.

3. **Site / placement record**
   - physical host context;
   - no invented production task.

4. **Configuration snapshot**
   - known values;
   - unknown values explicitly represented;
   - provenance for each material fact where possible.

5. **Evidence map**
   - existing Siglo 21 field session records;
   - Component Health evidence refs;
   - agreement/context artifacts if authorized later;
   - unknown/missing artifacts remain visible.

6. **Reference baseline**
   - a baseline means “known placement/configuration context at this time”;
   - it does **not** imply production acceptance, safety approval or customer approval.

7. **Gap report**
   - facts the current model cannot express;
   - missing source artifacts;
   - semantically unknown fields;
   - data-governance restrictions.

## 8. Definition of Done — V0.5

V0.5 is complete when:

- the real Siglo 21/Humandroid placement can be represented without fake Customer/Task facts;
- owner/provider, host institution and site are distinguishable;
- task/commercial context can be absent;
- existing field-evidence references attach to the same robot/placement truth without moving sensitive raw telemetry into GitHub;
- unknowns remain explicit;
- a deterministic baseline can be reconstructed;
- no `PILOT`, `PRODUCTION`, `CUSTOMER_APPROVED`, `SAFE` or equivalent state is inferred from the institutional placement;
- the resulting domain changes are covered by migration/tests before V0.5 can be marked `VERIFIED_LOCAL`.

## 9. What this case can validate

- Deployment Control can represent non-commercial real-world placements.
- Shared robot/config/evidence truth can support multiple products.
- Component Health evidence can reference Deployment Control without becoming a duplicate system of record.
- Baseline semantics can exist without production acceptance semantics.

## 10. What this case cannot validate

- production deployment workflow;
- customer acceptance;
- production task readiness;
- safety approval;
- recurring commercial value;
- real change-impact workflow;
- source-system integration need.

Those require later cases/versions.

## 11. Existing evidence references

Use existing Siglo 21 records as references, not as permission to publish raw data:

- `docs/pilots/siglo21/robotics-integration-v0-record.md`
- `docs/pilots/siglo21/field-kit-v0.md`
- `docs/pilots/siglo21/field-runbook-v0.md`
- `docs/pilots/siglo21/evidence/`
- Component Health V0.3–V0.4.3 records.

## 12. Next engineering question

Before implementation, choose the smallest schema change that can represent this case **without turning every commercial field into nullable ambiguity**.

The implementation PR must include migration, seed adaptation, deterministic tests and UI/reports that distinguish institutional placement from commercial/production deployment.

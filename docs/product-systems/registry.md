# Elaris — Product Systems Registry

This registry is the repository-level index of Elaris Product Systems.

Canonical product strategy/discovery remains in Notion. This file exists so humans and AI agents can quickly understand **what each product system is, its evidence level, and what must happen next** before coding.

## Registry

| Product System | Primary actor | Core job / decision | Product evidence | Demo state | Next validation |
|---|---|---|---|---|---|
| **Deployment Control** | Robotics Integrator / Deployer / RaaS | What is actually deployed, what evidence supports it, and what deserves review when it changes? | **PILOT / reference** | **LIVE reference** | Real Humandroid deployment + real artifacts + real change |
| **Operational Readiness** | Enterprise Buyer / Operator / Procurement | Can we accept this system into operation, under what conditions, and what changed since acceptance? | HYPOTHESIS | Visual prototype | Interview buyer/operator; reconstruct last go-live gate |
| **Safety Change Control** | Safety / EHS | What hazards, controls, tests and safety decisions deserve review after a change? | HYPOTHESIS | Visual prototype | Interview safety practitioner; inspect real hazard/change workflow |
| **Evidence Review** | Test Lab / Certification / Independent Assurance | What is in assessment scope, what evidence supports it, what findings remain, and what changed? | HYPOTHESIS | Visual prototype | Interview assessor/reviewer; request real assessment artifact set |
| **Placement Workspace** | Insurance Broker / PAS / Wholesale Broker | How do we build and maintain the technical risk submission and answer markets without rebuilding it? | HYPOTHESIS | **DEMO READY** | Show last robotics/autonomy placement; compare questions/artifacts |
| **Underwriting Workspace** | Insurer / MGA / MGU / Underwriter | Do we understand the deployed exposure enough to make a human underwriting decision and know what later changes matter? | HYPOTHESIS | Concept prototype | Underwriter interview; identify actual decision-changing inputs |
| **Incident Reconstruction** | Claims / Loss Adjuster / Forensic / Investigation | What happened, under which exact configuration, what changed before it, and what remains unknown? | HYPOTHESIS | Visual prototype | Claims/forensic interview using one real incident chronology |
| **Product & Field Evidence** | OEM / Component / Software / Model Vendor | Which product/version is deployed where and who may be affected by a release/change/advisory? | HYPOTHESIS | Spec only | OEM/component vendor interview |
| **Cyber / OT Change Assurance** | IT / Cyber / OT Security | What connectivity/software/access changed and what security review is required? | HYPOTHESIS | Spec only | OT/cyber interview around last robot/site onboarding |
| **Service & Configuration History** | Maintenance / Repair / Field Service | What intervention occurred, what changed, and what must be checked before return to service? | HYPOTHESIS | Spec only | Field-service interview + work order artifacts |
| **Asset Monitoring** | Leasing / Lender / Asset Finance / Economic Owner | What asset do we finance/own, what is its technical state, and what events threaten continuity/value? | HYPOTHESIS | Spec only | Asset-finance / RaaS capital interview |
| **Portfolio / Accumulation Intelligence** | Carrier Portfolio Risk / Reinsurer / Capacity | Where are concentrations/common dependencies across many insured/deployed systems? | DATA-DEPENDENT FUTURE | Concept only | Requires real portfolio + exposure data first |
| **Risk Intelligence** | Cross-market / Elaris internal intelligence | Can normalized exposure, controls, events and outcomes produce reusable benchmarks? | LONG-TERM DATA FLYWHEEL | Do not build now | Requires multi-customer outcome dataset |
| **Component Health** | Integrator / Operator / Maintenance | Which components show credible degradation/failure signals and what inspection/maintenance action should happen next? | **NEW HYPOTHESIS** | None | Humandroid discovery: data availability + failure history + current maintenance process |

---

## Current focus

Elaris should not build every registry item in parallel.

The current high-value validation tracks are:

### Track A — Physical operation

```text
Humandroid
   ↓
Deployment Control
   ↓
real deployment truth
   ↓
test Component Health hypothesis
```

Goal:
- deepen the real integrator/deployer workflow;
- determine whether component degradation/failure prediction is a real problem;
- learn what telemetry/history actually exists before designing ML.

### Track B — Insurance

```text
Deployment truth
    ↓
Placement Workspace
    ↓
Underwriting Workspace
    ↓
eventually claims / portfolio
```

Goal:
- test whether Elaris technical truth changes the quality/speed of insurance workflows;
- learn the real artifacts, questions and authority boundaries;
- avoid inventing automated risk/pricing models.

---

## Product creation rule

A new product should not enter the registry merely because a feature sounds useful.

Before registration, define at minimum:

1. one primary actor;
2. one recurring job/decision;
3. a trigger;
4. real or hypothesized inputs;
5. a beginning-to-end process;
6. a concrete output;
7. the AI/deterministic role;
8. the human authority boundary;
9. which shared Elaris truth it reuses;
10. what real-world evidence would validate or kill it.

If the proposal cannot satisfy these, it is probably:
- a feature;
- an integration;
- a shared platform capability;
- or an undeveloped idea.

---

## Cross-product flywheel hypothesis

The platform thesis is not only that products share infrastructure.

The stronger long-term thesis is:

```text
Product A creates useful structured facts
              ↓
shared Elaris graph
              ↓
Product B can make a better workflow
              ↓
new decisions / events / outcomes
              ↓
shared Elaris graph becomes richer
              ↓
future products can become better
```

This is a hypothesis, not yet a demonstrated data moat.

Do not describe it externally as proven until Elaris has multi-customer, cross-product evidence.

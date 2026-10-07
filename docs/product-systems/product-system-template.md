# Elaris — Product System Template

Copy this file when proposing a new Elaris Product System.

Do not start with screens.

Start with the system.

---

# <Product System Name>

## 1. Status

Choose one:

- HYPOTHESIS
- SPECIFIED
- CONCEPT PROTOTYPE
- DEMO READY
- PILOT
- VALIDATED
- PAID

Explain the evidence supporting that status.

## 2. Primary actor

Who performs the workflow?

Avoid “everyone”.

## 3. Problem / decision

What recurring job or decision does this actor need to complete?

Write it as a question if possible.

> “...?”

## 4. Trigger

What event causes work to enter the system?

Examples:
- new deployment;
- material change;
- renewal;
- incident;
- maintenance event;
- new submission;
- customer request.

## 5. Inputs

What facts/artifacts must exist?

Separate:

### Shared Elaris inputs
Facts already owned by the shared substrate.

### External inputs
Facts/artifacts that must come from another source.

### Missing/unknown inputs
Information we suspect is needed but have not validated.

## 6. System process

Describe the beginning-to-end process.

```text
Trigger
  ↓
Input
  ↓
Step
  ↓
Step
  ↓
Human / machine review
  ↓
Output
```

## 7. AI role

What does AI actually do?

Possible categories:
- extraction;
- classification suggestion;
- retrieval;
- summarization;
- anomaly detection;
- forecasting;
- prediction;
- planning;
- drafting;
- no AI needed.

For each AI function state:
- input;
- model/logic family;
- output;
- confidence/uncertainty handling;
- what a human still decides.

Never write “AI-powered” as the architecture.

## 8. Deterministic logic

Which parts must be rule-based/reproducible?

Examples:
- configuration diff;
- hashes;
- relationship queries;
- threshold logic;
- version reconstruction.

## 9. Human authority

Who can make the consequential decision?

Examples:
- Safety Lead;
- underwriter;
- assessor;
- customer engineer;
- technician.

State what Elaris must never decide automatically.

## 10. Output

What usable record/action leaves the workflow?

Examples:
- report;
- work order;
- decision record;
- evidence pack;
- alert;
- submission;
- change review;
- inspection request.

## 11. Shared Elaris data reused

List shared objects/relationships.

## 12. New data created

What structured facts does this product create that could be useful elsewhere?

Do not assume those objects belong in the shared schema yet.

## 13. Product boundaries

### This product is

...

### This product is not

...

## 14. Features

List capabilities inside the product.

Features are not automatically separate products.

## 15. Information architecture

Only after the system is clear, define:
- Home / Work Queue;
- primary list;
- primary detail;
- workflow/review;
- outputs/reports;
- settings/integrations if necessary.

## 16. Demo scenario

One coherent scenario that can populate every screen.

Separate:
- real/shared demo truth;
- synthetic actor-workflow data.

## 17. Non-claims

State safety/regulatory/insurance/legal/model limitations.

## 18. Validation plan

### Real actor to interview

...

### Ask first

> “Mostrame la última vez que hicieron esto.”

### Artifacts to request

...

### Assumptions to test

...

### Kill criteria

What evidence would show this should not be a standalone product?

### Build criteria

What repeated field evidence would justify persistent backend/integrations?

## 19. Next action

One concrete next step.


## 20. Versioned planning pack

Once the Product System is accepted into the registry, create:

```text
docs/product/<slug>/
├── README.md
├── roadmap.md
├── version-registry.md
└── execution-backlog.md
```

The roadmap must be split into:
- Scope A — work possible with current assets;
- Scope B — work gated by a real actor/case/artifact;
- Scope C — repeated/commercial/data-dependent expansion.

Every version must state result, current state and an evidence gate. Engineering verification, actor validation, data/export approval, human authority and commercial validation remain independent.

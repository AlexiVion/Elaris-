# Humandroid — Demo Data Audit v1

## Conclusion

The current MVP already covers most of the Deployment Control pilot narrative. The right strategy is to adapt it, not rewrite it.

The demo anchor is:

- Deployment: `DEP-0017`
- Robot: Unitree G1 `G1 #017`
- Active configuration: `C004`
- Active baseline: `B-0017-01`
- Golden change: `CHG-0005`
- Change: BrainCo Revo2 → Inspire RH56DFX + control-stack update

## Pilot-spec coverage

| Pilot need | Status | Current implementation |
| --- | --- | --- |
| Unitree G1 identity | Ready | G1 #017 |
| Versioned configuration | Ready | C003 → C004 → C005 |
| Hardware / firmware / control / skill / AI model | Ready | ConfigItems |
| Deployment context | Ready for demo | DEP-0017 |
| Task / environment / operating mode / human exposure | Ready | deployment + task + site |
| Evidence | Ready | evidence items |
| Requirements | Ready | EvidenceItem category REQUIREMENT |
| Human approvals | Ready | named Approval rows |
| Gaps / readiness | Ready | readiness engine |
| Baseline history | Fixed in Sprint 01 | complete active/future frozen state |
| Change diff | Ready | CHG-0005 |
| Deterministic Change Impact | Ready | engine + persisted impact items |
| Human review workflow | Fixed in Sprint 01 | named re-approval boundaries |
| System Passport | Ready | report |
| Deployment Readiness Pack | Ready | report |
| Change Impact Report | Ready | report |
| Share View | Ready | hashed, expiring, revocable links |
| Evidence Map traceability | Waiting on validation | no explicit evidence→requirement relation |
| Real-data onboarding | Manual for pilot | no self-service create deployment flow |
| Basic provenance | Ready | source / owner / URI / SHA-256 / timestamps |

## Sprint 01 gaps

### 1. Baseline freeze completeness
Resolved in code:
- future baselines freeze task, environment, evidence and approvals;
- active demo baselines freeze evidence/approval state;
- the older B-0017-00 fixture remains intentionally incomplete because the historical evidence state was never modeled and must not be fabricated.

### 2. Approval semantics
Resolved in code:
- an affected approval is a separate RE_APPROVE impact obligation;
- only the named approver can resolve it;
- another role cannot satisfy it;
- generic waiver is blocked;
- final change approval waits for all affected approvals.

### 3. Evidence Map semantics
Documented as a pilot-safe proposal.

Current UI may group Evidence and Requirements by deployment and configuration scope, but must not claim that Evidence A formally satisfies Requirement B until Humandroid validates that relationship.

## What does not block Sprint 01

These can remain manual:
- initial document intake;
- extraction from PDFs/spreadsheets;
- first real dataset loading;
- integrations;
- embedded document AI;
- actor-specific custom apps.

## Build order

1. baseline truth;
2. approval truth;
3. safe Evidence Map semantics;
4. validate existing flows;
5. polish Deployment Overview and Change Impact;
6. reports/share;
7. demo script;
8. full CI + smoke.

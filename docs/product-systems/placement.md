# Product System — Placement Workspace

## Status

**HYPOTHESIS · DEMO READY**

The current application is a realistic full demo. The broker workflow is not yet validated as a product.

## Primary actor

Insurance Broker / PAS / Wholesale Broker.

## Problem / decision

> **How do we describe a Physical AI risk technically to markets, identify what information is missing, and answer carrier questions without rebuilding the submission every time?**

## Trigger

- new insurance need;
- new deployment;
- renewal;
- material system change;
- market/carrier information request.

## Inputs

### Shared Elaris inputs

- Organization
- Robot
- Configuration
- Deployment
- Evidence
- Change
- Incident
- Share

### Hypothesis workflow inputs

- requested cover context;
- broker/client intake;
- market/carrier questions;
- responses;
- submission status/version.

These insurance workflow objects are not yet validated shared-schema commitments.

## System process

```text
Client / insurance need
        ↓
select real deployments/exposure
        ↓
assemble technical truth
        ↓
identify missing information
        ↓
construct submission version
        ↓
send / present to markets
        ↓
market questions
        ↓
link answers to technical facts/evidence
        ↓
quote / decline / bind process
        ↓
renewal or material change
        ↓
reuse prior truth + show what changed
```

## AI role

Potential useful roles:
- intake extraction from broker/client documents;
- map questions to existing Elaris facts/evidence;
- draft evidence-backed response suggestions;
- summarize technical changes since prior submission;
- identify repeated missing-information patterns.

AI must not provide regulated insurance advice or represent that a market has accepted a risk.

## Deterministic logic

Useful deterministic capabilities include:
- exact configuration/version lookup;
- before/after technical change diff;
- provenance links;
- incident history query;
- submission version history.

## Human authority

Broker/client humans decide what is submitted.

Carriers/underwriters make their own decisions.

Elaris does not:
- place risk;
- bind coverage;
- issue policies;
- provide placement authority.

## Outputs

- Technical Submission Pack
- Missing Information list
- Market Q&A record
- Renewal Change Summary
- market-specific read-only technical pack

## Shared data reused

Placement is strategically important because it can reuse technical truth created before insurance enters the workflow.

## New data created

Potentially:
- Submission
- Submission Version
- Market/Carrier reference
- Question
- Response
- Placement Status

These remain actor-product hypothesis objects until broker validation.

## Current demo

Current demo includes:
- Home / Attention Required
- Clients
- Submissions
- Submission detail
- Information Requests
- Market Questions
- Renewals
- Renewal detail
- Reports / Technical Submission Pack

## Validation plan

### Real actor

Broker/PAS/wholesale broker who has handled robotics, autonomy, industrial technology or similarly technical risk.

### Core interview prompt

> **Mostrame la última vez que hicieron una submission técnica compleja.**

### Ask for

- original client intake;
- submission/market presentation;
- carrier questions;
- client follow-up requests;
- renewal/change comparison if available.

### Assumptions to test

- technical information is repeatedly reconstructed;
- carrier questions can be linked to structured deployment/evidence facts;
- change history matters at renewal;
- a reusable technical pack saves meaningful time or improves quality.

### Kill / merge criteria

If brokers do not own enough of this workflow, or the problem is only document-generation, Placement may become a workflow inside another insurance product rather than a standalone Product System.

## Next action

Show the current full demo to a real broker and reconstruct one real placement end-to-end.

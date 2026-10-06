# Elaris Component Health — Field Evidence Audit Pilot

Status: Commercial Validation
Version: V0.1

## Product thesis

Elaris turns a real robot operating session into traceable component-level
operational evidence.

The audit answers:

> What actually happened across the robot's components during a real operation?

Elaris compares robot behavior across human-confirmed operating phases and
produces structured evidence for engineering review.

## Initial customer

The initial target customers are:

- robot integrators;
- robotics laboratories;
- small robot fleet operators;
- engineering teams evaluating or commissioning physical robots.

The product is not initially positioned toward large robot OEMs.

## Pilot

One robot.

One controlled field session.

Up to six relevant operating scenarios.

Read-only data acquisition.

Component-level analysis of available:

- position;
- velocity;
- torque estimate;
- temperature;
- voltage;
- state codes.

Delivery within 48 hours after a successful capture.

Includes:

- session timeline;
- component inventory;
- phase-by-phase evidence;
- same-session idle comparison;
- operational fingerprints;
- data-quality findings;
- unresolved observations;
- evidence provenance;
- machine-readable evidence pack;
- engineering review meeting.

## Validation price

USD 350 per pilot.

If Elaris cannot produce technically usable evidence because of an Elaris
integration failure, the pilot is not charged.

This is a validation price, not the final production price.

## Evidence boundary

The pilot produces descriptive operational evidence.

It does not produce:

- diagnosis;
- health scores;
- failure probability;
- remaining useful life;
- predictive-maintenance claims;
- safety certification.

Operational differences are observations, not pass/fail thresholds, unless a
separately validated rule exists.

## Data handling

Raw robot telemetry is not published.

Sensitive evidence remains private.

Client-facing derived material requires human review before external sharing.

The acquisition path is read-only unless a future product explicitly defines
and separately approves an actuation workflow.

## Technical validation

The V0.1 workflow has been exercised end-to-end against a real humanoid robot
field session:

capture -> integrity -> phase context -> component analysis -> evidence pack.

Technical validation is complete for the current product hypothesis.

## Commercial validation

Commercial validation is intentionally separate from technical validation.

Initial success criterion:

10 qualified customer conversations.

Target signal:

- at least 3 customers request a pilot;
- at least 1 customer pays for the pilot.

A paid pilot is the primary validation event.

## Next product decision

Do not expand functionality before commercial validation unless a blocking
technical defect prevents execution of a paid pilot.

Customer evidence determines the next product increment.

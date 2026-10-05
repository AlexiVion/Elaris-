# Elaris × NVIDIA Cosmos — Especificación de integración V0

**Estado:** PLANIFICADO · NO IMPLEMENTADO  
**Fecha:** 2026-10-05  
**Owner:** Elaris  
**Dependencia principal:** Dataset #001 del Unitree G1 real de Universidad Siglo 21  
**Gestión de proyecto:** GitHub only

---

## 1. Resumen ejecutivo

Elaris no compite con NVIDIA Cosmos, Isaac Sim, los OEM de robots ni los stacks de control.

Elaris mantiene la **verdad técnica, la provenance y la evidencia** que conectan:

- el robot físico real;
- su configuración exacta;
- el deployment real;
- los datos observados;
- las simulaciones;
- los escenarios contrafactuales;
- las decisiones humanas;
- y las vistas que consumen integradores, operadores, safety, brokers, underwriters y claims.

NVIDIA Cosmos se integra como una **capacidad externa de world modeling, reasoning y synthetic scenario generation**.

La integración objetivo es:

~~~text
MUNDO REAL
Robot / deployment / task / environment
        ↓
Elaris Robot Adapter
        ↓
Elaris Edge Collector
        ↓
Elaris Technical Truth
        ↓
Scenario Compiler
        ↓
WorldModelProvider
        ↓
CosmosProvider
        ├─ Cosmos Reasoner
        ├─ Cosmos Generator
        └─ Cosmos Action capabilities cuando el dominio sea compatible
        ↓
Isaac Sim / Isaac Lab cuando se requiera simulación física explícita
        ↓
Scenario Evidence
        ↓
Elaris Product Systems
~~~

Principio central:

> **Cosmos genera o razona sobre mundos posibles. Elaris conserva qué fue observado, qué fue simulado, qué se infirió, bajo qué configuración, con qué modelo y para qué decisión.**

---

## 2. Objetivo

Construir una integración reusable que permita transformar la verdad técnica de Elaris en escenarios evaluables mediante NVIDIA Cosmos sin acoplar el core de Elaris a NVIDIA ni mezclar datos reales con resultados sintéticos.

La primera validación debe usar:

**1 Unitree G1 real + 1 configuración observada + 1 Dataset #001 + 10–20 escenarios estructurados + 1 Scenario Evidence Pack.**

El primer caso de uso debe aportar valor a:

1. Component Health;
2. Deployment Control;
3. Physical AI Risk Record / Placement;
4. Incident Reconstruction.

---

## 3. Estado de partida de Elaris

La integración parte de infraestructura ya implementada.

### Robot Adapter V0

Elaris ya dispone de:

- `ReadOnlyRobotTransport`;
- contrato universal `RobotAdapter`;
- normalized telemetry events;
- component identities estables;
- ReplayTransport;
- Unitree G1 Adapter;
- Unitree G1 SDK2/DDS subscriber-only bridge;
- channel policy explícita;
- Robot Execution Context opcional.

### Edge Collector V0

Ya existe:

- captura local;
- AES-256-GCM;
- clasificación SENSITIVE;
- export NOT_APPROVED por defecto;
- revisión humana;
- checksums;
- capture replay;
- inspect/capture Unitree;
- Field Kit Siglo 21.

### Component Health V0

Estado actual:

**HYPOTHESIS · DEMO READY V0 · NO FIELD VALIDATION YET**

No se afirma:

- probability of failure;
- Remaining Useful Life;
- autonomous maintenance;
- predictive maintenance validado.

### Deployment Control

Es el reference product actual.

Mantiene:

- configuration snapshots;
- baselines;
- change diff;
- evidence;
- requirements;
- approvals;
- incidents;
- deterministic change impact.

### Insurance / Placement

Existe como hipótesis/demo y como línea comercial de Physical AI Risk Record.

La integración Cosmos debe reutilizar el mismo technical truth, no crear un silo separado.

---

## 4. Qué aporta NVIDIA Cosmos

A fecha 2026-10-05, Cosmos 3 expone dos superficies principales:

### Cosmos Reasoner

Input:

- text;
- image;
- video.

Output:

- text reasoning.

Casos relevantes:

- world understanding;
- temporal reasoning;
- physical plausibility;
- situation understanding;
- next-action reasoning;
- embodied reasoning;
- causal interpretation.

### Cosmos Generator

Input/output flexible según backend y modelo:

- text;
- image;
- video;
- sound;
- action.

Capacidades relevantes:

- world generation;
- future prediction;
- synthetic data;
- video generation;
- forward dynamics;
- inverse dynamics;
- policy/action modeling;
- transfer workflows.

### Restricción importante

Cosmos no debe tratarse como un parser genérico de `rt/lowstate`.

Los action models trabajan con contratos y dominios específicos. Un Unitree G1 de Siglo 21 no se vuelve automáticamente compatible con action-conditioned Cosmos únicamente porque Elaris tenga sus 29 joints.

Por eso la integración necesita:

~~~text
Elaris Canonical State
        ↓
Scenario Compiler
        ↓
Cosmos-compatible representation
~~~

y, cuando la simulación requiera dinámica física controlable:

~~~text
Elaris Technical Truth
        ↓
Isaac Sim / Isaac Lab
        ↓
Cosmos
~~~

---

## 5. Rol de Isaac Sim / Isaac Lab

Cosmos y Isaac no cumplen el mismo rol.

### Isaac Sim / Isaac Lab

Debe utilizarse cuando necesitamos:

- embodiment físico;
- robot model;
- URDF/USD;
- joints;
- collision;
- sensors;
- environment geometry;
- task execution;
- physics;
- software-in-the-loop;
- repeatable perturbations.

### Cosmos

Debe utilizarse cuando necesitamos:

- world reasoning;
- scenario generation;
- visual future generation;
- long-tail variation;
- plausible counterfactuals;
- synthetic scenario expansion;
- action reasoning cuando el dominio/modelo sea compatible.

Regla:

> **Isaac representa la física controlable; Cosmos amplía, razona o genera mundos; Elaris preserva la verdad y la evidencia.**

No todo escenario requiere Isaac.

---

## 6. Arquitectura objetivo

~~~text
┌──────────────────────────────────────────────────────────────┐
│                        PHYSICAL WORLD                        │
│ Unitree · TienKung · otros robots · tasks · sites · humans │
└──────────────────────────────┬───────────────────────────────┘
                               │
                     Robot Adapter Layer
                               │
                         Edge Collector
                               │
                     approved real evidence
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                         ELARIS CORE                          │
│ Robot · Component · Configuration · Deployment · Baseline  │
│ Evidence · Change · Incident · Execution Context           │
└──────────────────────────────┬───────────────────────────────┘
                               │
                       Scenario Compiler
                               │
                   ScenarioSpec + provenance
                               │
               ┌───────────────▼────────────────┐
               │       WorldModelProvider       │
               └───────────────┬────────────────┘
                               │
                    CosmosProvider V0
                ┌──────────────┼──────────────┐
                │              │              │
             Reasoner       Generator       Action*
                │              │              │
                └──────────────┼──────────────┘
                               │
                         ScenarioRun
                               │
                    optional Isaac layer
                               │
                       ScenarioEvidence
                               │
        ┌──────────────────────┼────────────────────────┐
        │                      │                        │
 Deployment Control      Component Health      Incident Reconstruction
        │                      │                        │
        └──────────────────────┼────────────────────────┘
                               │
                    Risk / Insurance Views
~~~

`Action*` solo cuando exista un dominio/contrato compatible y haya evidencia suficiente para mapear acciones correctamente.

---

## 7. Separación de verdad y simulación

Elaris nunca debe presentar un resultado sintético como si fuera evidencia observada.

Toda pieza debe tener un `evidenceClass`.

V0:

- `OBSERVED` — capturado desde mundo real o artefacto real;
- `SIMULATED` — producido por simulación/modelo;
- `INFERRED` — derivado por razonamiento/modelo;
- `HYPOTHESIS` — supuesto todavía no validado;
- `HUMAN_CONFIRMED` — revisión humana explícita sobre un hecho o interpretación.

Un output puede referenciar múltiples clases, pero no debe colapsarlas.

Ejemplo:

~~~text
OBSERVED
left knee torque = X

INFERRED
possible abnormal load pattern

SIMULATED
scenario rollout under reduced actuator performance

HYPOTHESIS
component degradation could increase task failure exposure

HUMAN_CONFIRMED
technician confirms inspection is warranted
~~~

---

## 8. Modelo conceptual de Scenario

### ScenarioSpec

Representa lo que queremos evaluar.

Campos V0:

~~~text
scenarioId
title
purpose
robotRef
configurationRef
baselineRef
deploymentRef
taskRef
environmentRef
componentRefs[]
executionContextRef?
observedEvidenceRefs[]
assumptions[]
disturbances[]
failureHypotheses[]
humanExposure?
requestedCapabilities[]
createdBy
createdAt
~~~

### ScenarioRun

Representa una ejecución concreta.

~~~text
runId
scenarioId
provider
providerVersion
model
modelVersion
runtime
seed
parameters
inputArtifactRefs[]
startedAt
completedAt
status
~~~

### ScenarioArtifact

~~~text
artifactId
runId
kind
  TEXT_REASONING
  IMAGE
  VIDEO
  ACTION_TRAJECTORY
  PHYSICS_TRACE
  METRIC
uri/localPath
sha256
sensitivity
evidenceClass
~~~

### ScenarioFinding

~~~text
findingId
runId
claim
evidenceRefs[]
confidenceDescriptor?
limitations[]
humanReviewStatus
~~~

No usar probabilidades numéricas de fallo salvo que exista un modelo calibrado con datos reales suficientes.

### ScenarioEvaluation

~~~text
evaluationId
runId
evaluator
checks[]
result
limitations[]
~~~

---

## 9. Scenario Matrix

El objetivo no es generar una lista arbitraria de prompts.

Elaris debe producir una matriz estructurada.

Dimensiones candidatas:

~~~text
Robot
× Configuration
× Component
× Task
× Environment
× Operating Mode
× Human Exposure
× Firmware / Software
× Controller / Policy
× Component State
× Disturbance
× Failure Hypothesis
× Recovery Behavior
~~~

Ejemplo:

~~~text
Unitree G1
× US21 Configuration #001
× Left Knee
× Valve Inspection
× Shared Workspace
× Supervised
× Firmware X
× Controller Y
× elevated torque
× partial actuator performance
× human enters workspace
~~~

La matriz genera `ScenarioSpec` reproducibles.

---

## 10. Scenario Compiler V0

El Scenario Compiler será el puente entre Elaris y cualquier world model/simulator.

Responsabilidades:

1. seleccionar un baseline real;
2. obtener robot/configuration/deployment;
3. adjuntar evidence observado;
4. materializar assumptions explícitos;
5. seleccionar scenario template;
6. construir inputs compatibles con provider;
7. registrar provenance;
8. rechazar scenarios con datos críticos desconocidos cuando corresponda;
9. producir un spec determinístico y versionable.

No debe:

- controlar el robot;
- inventar componentes;
- marcar como observado un supuesto;
- declarar una causa de incidente;
- inventar failure probability;
- ocultar model/version/seed.

---

## 11. Provider abstraction

Elaris no debe acoplar el core directamente a Cosmos.

Contrato propuesto:

~~~text
WorldModelProvider
├─ capabilities()
├─ reason(request)
├─ generate(request)
├─ forwardDynamics?(request)
├─ inverseDynamics?(request)
├─ policy?(request)
└─ health()
~~~

Primera implementación:

`CosmosProvider`.

Esto permite:

- cambiar backend NVIDIA sin tocar Scenario Compiler;
- utilizar NIM, Framework o endpoint hosted;
- mockear completamente la integración en tests;
- incorporar futuros providers si fuera útil.

---

## 12. Cosmos runtime strategy

No asumir que el hardware local puede ejecutar Cosmos.

La documentación oficial de Cosmos 3 muestra requisitos GPU significativos.

Por eso debe existir un Runtime Decision Gate.

Opciones:

### A. NVIDIA-hosted / managed endpoint

Preferible para spike rápido si el acceso y las condiciones de datos lo permiten.

### B. NIM en GPU cloud / servidor dedicado

Preferible para:

- API estable;
- control de runtime;
- OpenAI-compatible Reasoner;
- Generator mediante `/v1/infer`;
- aislamiento del core Elaris.

### C. Local NIM

Solo si existe GPU compatible y memoria suficiente.

### D. Cosmos Framework

Usar cuando se necesiten capacidades que no exponga el NIM seleccionado, especialmente experimentos action/generation avanzados.

Regla de seguridad:

> datos reales SENSITIVE no salen del boundary aprobado sin autorización explícita.

---

## 13. Dataset #001 — Siglo 21

La integración no debe bloquear la primera captura real.

Dataset #001 mantiene el alcance acordado:

- read-only;
- local;
- encrypted;
- no cloud upload during capture;
- `rt/lowstate`;
- joint state;
- motor state;
- temperatures;
- voltage;
- IMU;
- system state;
- no camera/audio/video.

Objetivos:

1. confirmar robot variant;
2. confirmar active DOF;
3. confirmar channels;
4. capturar baseline;
5. validar normalización;
6. obtener component identities observables;
7. producir el primer input real para Component Health.

**Dataset #001 no se envía automáticamente a Cosmos.**

Primero:

~~~text
capture
→ review
→ export approval
→ sanitization
→ approved scenario input
~~~

---

## 14. Dataset #002 opcional — visual context

Cosmos Reasoner y Generator obtienen mucho más valor cuando existe imagen/video.

Por eso puede existir posteriormente Dataset #002:

- cámara explícitamente autorizada;
- scope limitado;
- sin audio salvo autorización separada;
- local-first;
- clasificación SENSITIVE;
- consentimiento/institutional authorization;
- frames/video vinculados al mismo baseline y timestamp.

Dataset #002 es opcional y requiere un gate separado.

---

## 15. Casos de uso por Product System

### 15.1 Component Health

Objetivo:

> explorar consecuencias operacionales de señales reales sin convertir una señal en diagnóstico automático.

~~~text
Observed signal
→ Component Health
→ Scenario Compiler
→ Cosmos / Isaac
→ scenario outcomes
→ human review
→ service / inspect / continue
~~~

Ejemplos:

- elevated torque;
- thermal drift;
- actual-vs-desired tracking delta;
- reduced actuator performance;
- intermittent sensor degradation.

Output:

**Component Scenario Review**.

---

### 15.2 Deployment Control

Objetivo:

> asociar cambios reales de configuración con escenarios que merece volver a evaluar.

~~~text
Configuration change
→ deterministic Change Impact
→ scenario retest selection
→ simulation/reasoning
→ Scenario Evidence
→ human review
→ new baseline
~~~

El deterministic engine sigue siendo autoritativo para reglas de review.

Cosmos no reemplaza Change Impact.

---

### 15.3 Physical AI Risk Record / Placement

Nuevo deliverable candidato:

**Physical AI Scenario Stress Test**.

Combinación:

~~~text
Risk Record
+
Scenario Stress Test
~~~

Debe explicar:

- sistema;
- configuration;
- deployment;
- observed evidence;
- scenarios evaluados;
- assumptions;
- simulated outcomes;
- unresolved gaps;
- limitations.

No produce:

- insurance pricing;
- coverage recommendation;
- binding decision;
- probability of loss no calibrada.

---

### 15.4 Incident Reconstruction

Objetivo:

> reconstruir el contexto real y explorar hipótesis o contrafactuales sin declarar causalidad automática.

~~~text
Incident
→ exact baseline
→ telemetry/evidence
→ Cosmos Reasoner
→ candidate interpretations
→ optional Isaac/Cosmos counterfactuals
→ human expert review
~~~

Siempre separar:

- hechos observados;
- hipótesis;
- resultados simulados.

---

## 16. Primer deliverable comercial

Nombre de trabajo:

# Physical AI Scenario Evidence Pack

Contenido V0:

1. System / Deployment Snapshot
2. Observed Evidence Summary
3. Scenario Matrix
4. Scenario Cards
5. Model / Runtime Provenance
6. Simulation Assumptions
7. Findings
8. Open Questions
9. Limitations
10. Human Review
11. Change / Incident linkage cuando aplique

Versión preview:

- 3–5 escenarios;
- sirve para discovery/demo.

Versión completa:

- número de escenarios acordado;
- evidencia completa;
- revisión humana;
- entregable pago.

No asumir precio antes de validación comercial.

---

## 17. Seguridad y governance

### Robot safety

La integración Cosmos no modifica la frontera existente:

- Robot Adapter read-only;
- no publish;
- no command;
- no actuation;
- no remote control.

### Data governance

Cada input debe conocer:

- source;
- classification;
- approval status;
- allowed use;
- provenance.

### Model governance

Cada run registra:

- provider;
- model;
- model version;
- runtime;
- parameters;
- seed cuando aplique;
- timestamp;
- input hashes;
- output hashes.

### Human authority

Cosmos no decide:

- safe / unsafe;
- certified / compliant;
- component failed;
- return-to-service;
- insurance acceptance;
- incident legal cause.

---

## 18. Non-goals V0

No construir en V0:

- predictive maintenance product completo;
- RUL;
- failure probability model;
- autonomous robot control;
- autonomous safety approval;
- generic digital twin platform;
- replacement de Isaac Sim;
- replacement de OEM tooling;
- cloud telemetry platform;
- universal action-policy training;
- insurance risk score;
- legal causation engine.

---

## 19. Success criteria

V0 se considera técnicamente útil si:

- Dataset #001 existe y está approved para el experimento;
- un ScenarioSpec puede reproducirse;
- al menos un provider call funciona end-to-end;
- model/runtime provenance queda registrada;
- observed/simulated/inferred no se mezclan;
- 10–20 scenarios pueden ejecutarse de forma trazable;
- se genera un Scenario Evidence Pack;
- Humandroid puede revisar el resultado;
- al menos un broker/risk actor puede evaluar la utilidad del mismo technical truth;
- no se agrega control capability al robot.

---

## 20. Kill / modify criteria

Modificar o frenar si:

- Cosmos no aporta valor por encima de una simulación determinística más simple;
- el mapping desde Elaris hacia el modelo genera demasiado supuesto no verificable;
- falta suficiente contexto visual/físico;
- los outputs no cambian ninguna decisión humana;
- el coste/runtime no es justificable;
- Isaac/OEM tools ya resuelven el trabajo sin necesidad de una capa Elaris;
- se pierde la separación entre observed y simulated.

---

## 21. Dependencias externas

- NVIDIA Cosmos 3;
- NVIDIA NIM / NGC o runtime equivalente;
- Cosmos Framework para capacidades avanzadas cuando corresponda;
- NVIDIA Isaac Sim / Isaac Lab para simulación física;
- Unitree SDK2 para el caso G1;
- autorización de acceso a robot/datos reales.

---

## 22. Referencias técnicas oficiales

Revisadas el 2026-10-05:

- NVIDIA Cosmos: https://github.com/NVIDIA/cosmos
- Cosmos 3 cookbooks: https://github.com/NVIDIA/cosmos/tree/main/cookbooks/cosmos3
- Cosmos Reasoner: https://github.com/NVIDIA/cosmos/tree/main/cookbooks/cosmos3/reasoner
- Cosmos Action: https://github.com/NVIDIA/cosmos/tree/main/cookbooks/cosmos3/generator/action
- Cosmos NIM: https://github.com/NVIDIA/cosmos/tree/main/cookbooks/cosmos3/nim
- Isaac Sim: https://developer.nvidia.com/isaac/sim

---

## 23. Regla de implementación

No implementar de forma especulativa todo el stack.

Orden obligatorio:

~~~text
Dataset #001 real
→ Scenario Contract
→ Provider Spike
→ Reasoner V0
→ Scenario Evidence Pack
→ Generator / Isaac donde aporte valor
→ real review
→ productization
~~~

La integración debe seguir la metodología Elaris:

> **real evidence → real work → repeated workflow → defined rule → automation → product.**

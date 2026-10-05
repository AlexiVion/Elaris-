# ADR — Cosmos Runtime V0

**Estado:** ACCEPTED FOR NON-SENSITIVE SPIKE · LIVE SMOKE PENDING  
**Fecha:** 2026-10-05  
**Track:** Elaris × NVIDIA Cosmos  
**Ticket:** COSMOS-003  
**Owner:** Elaris

---

## 1. Decisión

Para V0 se adopta una estrategia en dos niveles:

1. **Runtime primario de engineering/spike:** endpoint hosted de NVIDIA para `nvidia/cosmos3-nano-reasoner`, limitado estrictamente a inputs `PUBLIC` / `INTERNAL` no sensibles y fixtures synthetic/replay.
2. **Fallback y runtime requerido para datos sensibles/reales cuando corresponda:** Cosmos3 Reasoner NIM self-hosted en una GPU cloud o servidor dedicado dentro de un boundary explícitamente aprobado.

No se selecciona Local NIM como default V0.

No se selecciona Cosmos Framework como default V0.

Generator/action no forman parte de esta decisión operativa inicial salvo para dejar el capability boundary preparado.

---

## 2. Motivo

El objetivo de P3/P4 es validar rápido si Reasoner agrega valor a decisiones humanas sin convertir el runtime en el producto.

El endpoint hosted reduce drásticamente el setup para un primer smoke y está actualmente publicado por NVIDIA como **Free Endpoint** de desarrollo. Sin embargo, la experiencia hosted de prueba indica que input/output puede ser registrado por NVIDIA, y las requests pueden estar rate-limited.

Por eso:

> hosted es válido para synthetic/non-sensitive engineering, pero no queda autorizado por este ADR para Dataset #001 SENSITIVE.

Cuando Elaris necesite procesar evidencia real sensible fuera del boundary local, debe existir autorización explícita y un runtime aprobado. La opción preferida para ese caso es NIM self-hosted en infraestructura controlada.

---

## 3. Estado actual verificado — 2026-10-05

### Cosmos3 Reasoner

Modelo objetivo inicial:

`nvidia/cosmos3-nano-reasoner`

NVIDIA documenta:

- input text/image/video;
- output text;
- API OpenAI-compatible;
- `POST /v1/chat/completions`;
- text-only queries soportadas para Cosmos3 Nano/Super Reasoner;
- NIM descargable;
- endpoint hosted gratuito para desarrollo;
- modelo Nano 8B y Super 32B.

### NIM Reasoner

La matriz NVIDIA VLM NIM 1.7.0 documenta para Cosmos3-Nano, entre otros:

- generic BF16: >56 GB VRAM;
- L40S 48 GB: FP8, 1 GPU;
- H100 80 GB: FP8, 1 GPU;
- H200 141 GB: FP8, 1 GPU;
- aproximadamente 20 GB de disk artifact para perfiles FP8 listados.

La selección real de GPU debe volver a verificarse al desplegar porque NVIDIA actualiza NIMs y matrices.

### Generator

Cosmos3 Generator utiliza un contrato distinto y su NIM expone `POST /v1/infer`.

No se debe asumir que el mismo client Reasoner sirve para Generator.

### Action

Los action dimensions dependen del embodiment/domain.

Aunque la documentación Cosmos3 liste configuraciones humanoid 29D, eso **no demuestra** compatibilidad del Unitree G1 de Siglo 21 ni autoriza un mapping.

Cualquier action integration debe volver a comprobar el contrato exacto y fallar cerrado si no existe mapping demostrado.

---

## 4. Comparación de runtimes

| Runtime | Auth | GPU Elaris | Data governance | Reproducibilidad | Complejidad | Uso V0 |
|---|---|---:|---|---|---|---|
| NVIDIA hosted | API key | No | EXTERNAL; trial puede registrar I/O | Media/baja si backend revision no es observable | Muy baja | **PRIMARY para synthetic smoke** |
| NIM en GPU cloud | NGC key para pull + controles del deployment | Sí/cloud | Controlable según proveedor/contrato | Alta si image/model/profile quedan fijados | Media | **FALLBACK / real sensitive path** |
| NIM servidor dedicado | NGC key para pull | Sí/dedicada | Máximo control operativo | Alta | Alta | Caso institucional/producción |
| Local NIM | NGC key para pull | Sí/local | Local | Alta | Alta + hardware | No default: hardware no validado |
| Cosmos Framework | gated model/deps según integración | Sí | depende del host | Alta pero mayor superficie | Muy alta | Experimentos posteriores |

---

## 5. Criterios de selección

Orden aplicado:

1. seguridad de datos;
2. capability necesaria;
3. coste;
4. reproducibilidad;
5. setup operativo.

### Hosted gana el spike porque

- no requiere provisionar GPU;
- Reasoner es la primera capability priorizada;
- permite probar ScenarioSpec → Reasoner con synthetic data;
- reduce tiempo hasta evidencia de utilidad.

### Hosted pierde como runtime de evidencia sensible porque

- implica egress externo;
- la trial experience documenta recording de input/output;
- rate limits/latency/SLA no son controlados por Elaris;
- la observabilidad de una revisión de modelo inmutable debe comprobarse en el smoke.

### NIM cloud es el fallback porque

- conserva API Reasoner compatible;
- permite fijar image/runtime/model profile;
- mejora aislamiento y reproducibilidad;
- permite diseñar un boundary aprobado para datos reales.

---

## 6. Data policy

El provider contract V0 distingue explícitamente:

- sensitivity;
- external-use approval;
- runtime data egress.

Regla:

~~~text
runtime.dataEgress = EXTERNAL
+
request/input = SENSITIVE | RESTRICTED
+
externalUseApproval != APPROVED
→ FAIL CLOSED
~~~

Dataset #001 sigue:

~~~text
capture local
→ review
→ export approval
→ sanitization
→ approved scenario input
~~~

Este ADR no aprueba automáticamente ningún export.

---

## 7. Secrets

Credentials nunca deben formar parte de:

- ScenarioSpec;
- ScenarioRun parameters;
- provider result metadata;
- logs;
- committed config.

El contrato P3 rechaza secret-like keys dentro de request parameters.

Las futuras credenciales Cosmos/NVIDIA deben entrar desde secret/env/config del runtime y no desde objetos que Elaris persiste como provenance.

---

## 8. Provenance mínima por invocation

Toda ejecución real debe conservar, cuando esté disponible:

- provider;
- provider version;
- model;
- model version/revision;
- runtime kind;
- runtime id;
- scenario hash;
- input refs;
- input hashes;
- parameters;
- timestamp;
- software commit SHA.

Si el hosted endpoint no permite observar una model revision suficiente, P4 debe registrar explícitamente esa limitación.

No inventar una versión para llenar el campo.

---

## 9. Latency y coste

### Hosted

- catálogo actual: Free Endpoint para desarrollo;
- requests pueden ser rate-limited;
- latency real: **PENDING LIVE SMOKE**;
- pricing/SLA de producción: **NOT ESTABLISHED por este ADR**.

No extrapolar el endpoint gratuito a coste comercial cero.

### Self-hosted NIM

Coste depende de:

- GPU elegida;
- tiempo de ejecución;
- proveedor cloud;
- storage/network;
- concurrency.

No elegir proveedor GPU ni estimar unit economics sin medición.

---

## 10. Gate de smoke call

P3 no queda completamente validado hasta ejecutar una request no sensible.

Input recomendado:

- golden synthetic ScenarioSpec;
- sin Dataset #001;
- sin nombres/identificadores institucionales necesarios;
- sin secretos en request body;
- text-only Reasoner para minimizar superficie.

Registrar:

- endpoint/runtime;
- health/discovery disponible;
- model id;
- model/version metadata disponible;
- request format;
- response format;
- latency;
- response hash;
- errores/warnings;
- commit SHA.

### Estado actual

**BLOCKED ON CREDENTIAL/EXTERNAL ACCESS.**

No existe una NVIDIA API key disponible en el contexto de ejecución actual.

No se reemplaza este gate con `MockWorldModelProvider`.

---

## 11. Triggers para abandonar hosted y promover NIM

Promover NIM cloud/dedicated si ocurre cualquiera:

1. se necesita enviar data SENSITIVE/RESTRICTED real;
2. la policy institucional prohíbe hosted trial;
3. model revision/provenance hosted es insuficiente;
4. rate limits impiden el workflow;
5. latency vuelve inútil el use case;
6. se necesita runtime fijado/reproducible para evidence packs;
7. coste/SLA commercial exige control propio.

---

## 12. Fuentes verificadas

Documentación oficial revisada el 2026-10-05:

- NVIDIA Cosmos 3 Quickstart: https://docs.nvidia.com/cosmos/latest/cosmos3/quickstart_guide.html
- NVIDIA NIM VLM Cosmos3 Reasoner API: https://docs.nvidia.com/nim/vision-language-models/1.7.0/examples/cosmos-reason3/api.html
- NVIDIA NIM VLM 1.7.0 Support Matrix: https://docs.nvidia.com/nim/vision-language-models/1.7.0/support-matrix.html
- NVIDIA Build — cosmos3-nano-reasoner: https://build.nvidia.com/nvidia/cosmos3-nano-reasoner
- NVIDIA NIM Cosmos WFM API: https://docs.nvidia.com/nim/cosmos/latest/api-reference.html
- NVIDIA Cosmos3 Model Reference: https://docs.nvidia.com/cosmos/latest/cosmos3/model_reference.html

---

## 13. Consecuencias

### Positivas

- Core Elaris queda desacoplado de NVIDIA.
- P4 puede implementar CosmosProvider sin contaminar Scenario Domain.
- CI usa mock sin credenciales.
- Sensitive egress falla cerrado.
- Hosted permite medir valor antes de pagar infraestructura GPU.
- NIM queda definido como escape hatch de control/reproducibilidad.

### Costes

- habrá al menos dos runtime modes;
- hosted y self-hosted pueden exponer metadata distinta;
- model-version observability debe normalizarse;
- P3 conserva un gate externo pendiente hasta ejecutar smoke real.

---

## 14. Decisión final P3

**KEEP.**

- WorldModelProvider: KEEP.
- NVIDIA hosted: KEEP para non-sensitive spike.
- NIM cloud/dedicated: KEEP como fallback / sensitive-data runtime.
- Local NIM: DEFER.
- Cosmos Framework: DEFER.
- Real Cosmos validation: **NOT YET CLAIMED**.

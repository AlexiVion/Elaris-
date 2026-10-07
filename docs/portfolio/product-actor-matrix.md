# Elaris — Product × Actor Matrix

Legend: **P** primary actor · **W** participant/reviewer · **S** source · **C** downstream consumer.

## A01–A10
| Product | A01 | A02 | A03 | A04 | A05 | A06 | A07 | A08 | A09 | A10 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Deployment Control / Deployment & Change Evidence | S | S | S | P | P | W | W | W | W | W |
| Operational Readiness | — | — | — | S | S | P | W | P | W | W |
| Safety Change Control | S | S | S | W | W | C | — | W | P | — |
| Evidence Review | S | S | S | W | W | C | — | — | W | — |
| Placement Workspace | — | — | — | S | S | W | — | — | — | — |
| Underwriting Workspace | — | — | — | S | S | S | — | — | — | — |
| Incident Reconstruction | S | S | S | W | W | C | — | W | W | W |
| Product & Field Evidence | P | P | P | W | W | — | — | — | C | C |
| Cyber / OT Change Assurance | — | S | S | W | W | C | — | W | C | P |
| Service & Configuration History | S | S | — | W | W | C | — | W | C | — |
| Asset Monitoring | — | — | — | S | W | W | — | — | — | — |
| Portfolio / Accumulation Intelligence | — | — | — | — | — | — | — | — | — | — |
| Risk Intelligence | C | C | C | S | S | C | — | — | C | C |
| Component Health | — | S | — | W | W | C | — | W | C | — |

## A11–A20
| Product | A11 | A12 | A13 | A14 | A15 | A16 | A17 | A18 | A19 | A20 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Deployment Control / Deployment & Change Evidence | W | W | W | C | C | — | C | C | S | — |
| Operational Readiness | W | W | S | C | C | — | C | — | — | — |
| Safety Change Control | W | W | S | — | C | — | — | C | — | — |
| Evidence Review | P | W | S | C | C | — | — | — | — | — |
| Placement Workspace | — | W | — | P | S | C | S | — | — | — |
| Underwriting Workspace | — | W | — | W | P | C | S | S | — | C |
| Incident Reconstruction | — | W | W | — | W | C | C | P | S | C |
| Product & Field Evidence | C | — | W | — | C | C | C | C | S | C |
| Cyber / OT Change Assurance | C | W | — | — | C | — | — | — | S | — |
| Service & Configuration History | — | — | P | — | C | — | C | C | S | — |
| Asset Monitoring | — | W | S | C | C | C | P | — | S | — |
| Portfolio / Accumulation Intelligence | — | C | — | S | W | P | S | — | — | W |
| Risk Intelligence | C | — | S | S | W | W | S | S | S | P |
| Component Health | — | — | P | — | C | — | C | C | S | C |

## Actor key
- **A01** — [Component / Subsystem / Material Supplier](../industry/archetypes/component-supplier.md)
- **A02** — [Robot OEM](../industry/archetypes/robot-oem.md)
- **A03** — [AI / Software / Model Provider](../industry/archetypes/ai-software-provider.md)
- **A04** — [Robotics Integrator / Solution Provider](../industry/archetypes/robotics-integrator.md)
- **A05** — [Deployer / RaaS Operator](../industry/archetypes/deployer-raas.md)
- **A06** — [Enterprise Buyer / Business Owner](../industry/archetypes/enterprise-buyer.md)
- **A07** — [Procurement / Strategic Sourcing](../industry/archetypes/procurement.md)
- **A08** — [Site Operations / Operator](../industry/archetypes/site-operations.md)
- **A09** — [Safety / EHS](../industry/archetypes/safety-ehs.md)
- **A10** — [Cyber / IT / OT Security](../industry/archetypes/cyber-it-ot.md)
- **A11** — [Test Lab / Certification / Conformity / Independent Assurance](../industry/archetypes/certification-assurance.md)
- **A12** — [Legal / Compliance / Risk Governance](../industry/archetypes/legal-compliance.md)
- **A13** — [Maintenance / Repair / Field Service](../industry/archetypes/maintenance-field-service.md)
- **A14** — [Insurance Broker / PAS / Wholesale Broker](../industry/archetypes/broker-pas.md)
- **A15** — [Insurer / MGA / MGU / Underwriter / Risk Engineer](../industry/archetypes/insurer-underwriter.md)
- **A16** — [Reinsurer / Capacity / Portfolio Risk](../industry/archetypes/reinsurer-capacity.md)
- **A17** — [Finance / Leasing / Economic Owner](../industry/archetypes/finance-leasing.md)
- **A18** — [Claims / Loss Adjuster / Forensic / Investigation](../industry/archetypes/claims-forensics.md)
- **A19** — [RobOps / Fleet / Telemetry / Observability Provider](../industry/archetypes/robops-telemetry.md)
- **A20** — [Data / Risk Intelligence / Analytics](../industry/archetypes/data-risk-intelligence.md)

This is a planning hypothesis except where field evidence explicitly validates a relationship.

# Elaris — visión fundacional de largo plazo
**Versión:** 2026-10-08 v1 · **Origen:** declaración explícita de los fundadores en sesión estratégica · **Estado:** dirección estratégica, NO afirmación de capacidad presente.

## 1. Qué queremos ser
Elaris aspira a construir una **infraestructura transversal de conocimiento, datos, evidencias y operaciones para la industria Physical AI y su cadena de valor completa**. No está limitada a seguros, una clase de robot, una jurisdicción ni un único actor.

Su universo de estudio comprende materiales y proveedores aguas arriba, fabricación de componentes y robots, sistemas de IA, herramientas y maquinaria de producción, integración, despliegue, operación, asistencia, mantenimiento, seguridad, certificación, compra/finanzas, seguros, reaseguros, incidentes, activos y aprendizaje. **Los 20 arquetipos A01–A20 son la primera taxonomía de actores, no la frontera definitiva de la industria**. Investigación posterior puede dividirlos o incorporar actores no representados, con historial de decisiones.

Elaris persigue dos ventajas acumulativas:
- **Comprensión de la industria:** modelar quién hace qué, quién depende de quién, qué inputs recibe, qué entrega, quién paga, qué decisiones toma y qué eventos generan trabajo.
- **Infraestructura reutilizable:** recoger y transformar hechos técnicos *con autorización, procedencia y contexto*, de forma que servicios/productos específicos reutilicen una misma representación, sin duplicar, apropiarse automáticamente ni mezclar datos de diferentes propietarios.

La ambición a muchos años incluye operar nuevos negocios a lo largo de la cadena —integración, fabricación de robots, habilidades, control de calidad, despliegue, servicios, seguros donde la ley lo permita— **únicamente cuando se demuestre una oportunidad y exista competencia/autoridad para hacerlo**. No implica que Elaris ya fabrica robots, asume riesgos, certifica sistemas o maneja flotas ajenas.

## 2. Principio estratégico
**Cobertura industrial global como visión; foco estrecho de ejecución como disciplina.** La primera especialización comercial puede ser preparación técnica de riesgos aseguradores y, eventualmente, distribución/MGA. No transforma la misión de Elaris en una empresa dedicada exclusivamente al seguro.

```text
INDUSTRIA PHYSICAL AI (A01..A20, taxonomía extensible)
    ⇅ relaciones: insumos, productos, contratos, datos, autoridad, riesgo, capital
CAPA ELARIS: grafo industrial + identidades/activos/configuraciones/eventos
    ⇅ procedencia, permisos, versiones, custodia y autoridad humana
CAPACIDADES COMPARTIDAS: ingesta, evidencia, comparación, revisión, reportes
    ⇅ productos / servicios elegidos por actor y decisión
VERTICALES: despliegue, salud de componentes, servicio, seguros, etc.
    ⇅ señales comerciales, resultados consentidos, aprendizaje autorizado
NUEVAS EMPRESAS / OPERACIONES FUTURAS — sujetas a validación y habilitaciones
```

## 3. Evitar tres errores
1. **Confundir vertical de entrada con identidad corporativa.** Una MGA no es la arquitectura central de Elaris; sería una empresa/operación vertical sobre la infraestructura.
2. **Confundir datos observados con datos propios.** El acceso técnico a un robot de terceros no autoriza comercialización, difusión, entrenamiento, agregación o cesión a una aseguradora.
3. **Confundir amplitud futura con paralelismo actual.** No construir los 14 productos ni 20 soluciones simultáneamente: vender uno o dos servicios próximos a capacidades verificadas y expandir con contratos y hechos.

## 4. Reglas del grafo industrial
Todo actor dispone de una ficha versionada: `actor_id`, función, eslabón de cadena, roles compradores/usuarios/decisores, autoridad, inputs, outputs, sistemas fuente, flujos de dinero, obligaciones/controles, eventos y tiempos, riesgos, información que necesita, información que genera, relaciones salientes/entrantes, contratos, jurisdicción, hipótesis, empresas verificadas, evidencias, oportunidades Elaris y estado de validación.
Relación actor-actor como arista explícita con `source_actor`, `target_actor`, `relation_type`, `object`, `economic_payer`, `data_owner`, `authority`, `jurisdiction`, `evidence_source`, `status`. No confundir un diagrama posible con una relación comprobada entre dos organizaciones reales.

## 5. Primera vía comercial y secuencia
**Capa instrumental:** Component Health + Deployment Control + evidencia/procedencia + captura read-only (capacidades parciales).
**Primer servicio:** paquete de evidencias técnicas para una empresa robótica / broker / equipo de riesgo, manual y revisado por humano.
**Siguientes entregables cercanos:** comparación técnica de cambios; seguimiento de versiones y evidencias; cuestionario/renovación para intermediario autorizado.
**Etapas condicionadas:** alianza comercial con broker/MGA → programa de seguros autorizado si hay demanda/capacidad/licencias → productos recurrentes → datos comparables y reutilización gobernada → expansión industrial multi-vertical.

**Éxito próximo:** primer artefacto útil aceptado y primer pago, no completar primero un backend 24/7 ni inscribirse como MGA sin compradores.

## 6. Decisiones fundacionales y control de cambios
- `VISION-001` — Se ratifica alcance horizontal + vertical e interés futuro en otros negocios industriales. Estado: `FOUNDER_DIRECTION`.
- `VISION-002` — Insurance/MGA = primera **hipótesis comercial**; no redefine la compañía. Estado: `RESEARCH`.
- `VISION-003` — Elaris mantiene límites de autoridad: hechos, inferencias y decisiones regulatorias separadas. Estado: `ARCHITECTURAL_RULE`.
- `VISION-004` — Se preservan los 20 arquetipos actuales y se abre tarea de completar grafo real y cadena upstream. Estado: `PLANNED`.

Referencia interna: `docs/industry/physical-ai-industry-map.md`, `docs/portfolio/README.md`, `docs/portfolio/product-dependency-map.md`. 

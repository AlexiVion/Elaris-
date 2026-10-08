# Boop — benchmark empresarial, propuesta de cobertura y economics hipotéticos
**Corte:** 2026-10-08 · **Fuentes:** B01 (web), B02 (pricing), B03 (§§6–8), L01 (Lloyd's), AR01–AR03 (Argentina).  
**Precaución:** datos comerciales de Boop son autodescripciones; no se verificó actividad regulatoria en registros ni se obtuvieron pólizas reales o resultados financieros.

## 1. Propuesta de valor Boop
**Comprador/usuario declarado:** empresas que ponen robots en operación comercial.
**Wedge:** responsabilidad por interacción física de robot, seguro del propio equipo, extensiones de cyber y business interruption.
**Unidad comercial:** Boop declara precio por robot cubierto, no por asiento de software; cotización según deployment, robot class/control mode y controles.
**Instrumentación:** la web describe un software RDR por robot cubierto; valor del dato para incidente, actualización de prima y aprendizaje futuro.

## 2. Catálogo anunciado
| Paquete | Contexto | Coberturas que Boop anuncia | Riesgo de extrapolación |
|---|---|---|---|
| Caged | zonas verificadas/restringidas | daños robot/máquina y reposición según valor | no implica condiciones legales fijas |
| Core | operación alrededor de personas/propiedad | lesiones personales, robot/robot, máquina, reposición, revisión de incidentes | letra de póliza/deducibles/exclusiones no públicos |
| Cyber+ | robots conectados | Core + pérdida física inducida por cyber + soporte respuesta | no implica cobertura cyber universal |
| Enterprise | grandes despliegues/alto riesgo | Cyber+ + BI por incidente y límites/condiciones a medida | no se publican precios/underwriters |

**No hay tarifa numérica pública en el sitio de pricing consultado.** El informe Elaris USD 490 es hipótesis totalmente independiente y **NO es el precio de Boop**.

## 3. Cadena de valor MGA declarada en el white paper
```text
robot / integrador / operador = cliente potencial y fuente de evidencia
         │
         ├── RDR software read-only + PAIDS A (Boop declara)
         ▼
     Boop / underwriting operations (propuesto)
         ├── Data & safety intake  [fuentes]
         ├── risk prior / BLP     [modelos no auditados]
         ├── delegated authority  [supeditada a contrato/regulación]
         └── claims classification[proceso revisable]
         │
    authorized fronting carrier ───── reinsurer / capacity
         │                                │
         └── policy + premiums            └── ceded risk/conditions
                     │
                claim / incident
                     │
        PAIDS observations → attribution review / claims decision
                     │
        consented outcome + history → risk/model iteration
```
**Hechos no verificados para Boop:** entidad que ostenta licencia/autoridad, carrier emisor, reaseguro efectivo, primas, pérdidas y estructura de remuneración. **No concluir** de un white paper que ya tenga un binder activo en todas las jurisdicciones.

## 4. Fuentes de ingresos posibles del modelo, sin atribuir cifras a Boop
- Comisión de suscripción a MGA/intermediario, si existe autoridad contractual.
- Fees por servicios técnicos/administración, según contrato.
- Profit commission contingente, a veces prevista en programas delegados.
- Negocio de datos/evidencias y servicio de siniestros, **únicamente** con permiso y derechos específicos.
- Suscripción software/event logging separada, si una empresa realmente la paga.

No consta reparto de ingresos de Boop en el documento analizado. La ganancia del MGA depende de costes de distribución, siniestros, capacidad, acuerdos regulatorios, gastos y volumen. Simular una «comisión de X%» como si fuera contrato real sería engañoso.

## 5. Por qué Boop combina software y seguro
- Necesita **datos de origen** para describir exposición e incidentes.
- Necesita **datos comparables entre sistemas** para modelar pérdidas y concentración.
- Necesita **contratos de datos** para acceder a telemetría con garantías.
- Necesita **capital y autoridad** para transformar información en póliza.
- Si consigue escala y derechos, el mismo corpus crea servicios para ingeniería de seguridad, ensayos y entrenamiento de modelos.

**Trade-off:** una aseguradora puede buscar controlar la información que afecta a sus primas; un integrador puede rechazar compartir secretos operacionales con quien evalúa su precio o responsabilidad. Elaris horizontal debería diseñar separación e independencia desde el inicio.

## 6. Versión viable Elaris sin ejercer rol asegurador
```text
CLIENTE autoriza  →  Elaris recibe archivos técnicos
                          ↓
             normalización/procedencia/gaps
                          ↓
                 expediente revisado
                          ↓
 CLIENTE o BROKER AUTORIZADO usa/entrega según permisos
                          ↓
         UNDERWRITER autorizado decide
```
Ingresos de Elaris **hoy:** tarifa documentada por servicio, independiente de emisión de póliza.
Relaciones que Juanma puede trabajar: corredor con mandato adecuado, agencia, aseguradora, datos requeridos y acuerdos de representación cuando legalmente posibles.
El valor diferencial no es «hacemos lo mismo que Boop» sino «hacemos utilizable y verificable la información técnica del riesgo de Physical AI, para múltiples actores».

## 7. Unit economics a levantar en entrevista
- **Costo técnico:** horas de ingesta, estructuración, QA, revisiones y soporte.
- **Costo de acquisition:** contactos, reuniones, ciclo de compras.
- **Frecuencia:** actualización por change y renovaciones, robots/documentos por cliente.
- **Willingness to pay:** integrador/deployer vs broker/insurer.
- **Margen:** fee bruto – horas/coste variable – impuestos – asesoría contractual – overhead.
- **Más adelante MGA:** written premium, take-rate autorizado, loss/expense ratio, capacidad disponible, capital/colateral/regulatory cost, sin inferir de Elaris actual.

## 8. Riesgos de imitación rápida
1. Preparar un «RDR casero» con telemetría incompleta e interpretar near misses sin control/sampling.
2. Proponer un score propietario de «insurability» y quedar expuesto a reclamos regulatorios.
3. Vender como distribuidores de seguros sin habilitación.
4. Obtener data de terceros sin derechos de sublicencia o de training.
5. Afirmar que unos datos de laboratorio habilitan póliza productiva.
6. Dependencia comercial de una sola MGA para el futuro horizontal de Elaris.

## 9. Checklist para Juanma frente a un broker/MGA
- Entidad legal, territorio, líneas, autorización y producto existente.
- Dónde se recibe una presentación, quién decide, quién emite, quién cobra.
- Campos obligatorios para 1 robot/humanoide, site, task, control mode.
- Información que hoy retrasa una decisión / dispara preguntas.
- ¿Contratarían dossier técnico a precio fijo? ¿Quién paga y qué volumen?
- Criterios de firma/custodia de evidencia y NDA.
- ¿Pueden pagarnos **por servicio** separado de cualquier comisión regulada?
- Si quieren negocio de originación: qué estructura habilitada y asesoría legal necesitan.

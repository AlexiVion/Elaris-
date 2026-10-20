// PRIVATE engineering review planning for G1 V0.3. Never a diagnostic or export approval.
// Pure transformation of an already source-checked findings ledger.
const PHASE_ID = "PHASE_OBSERVATION";
const SLOT_ID = "UNRESOLVED_SLOT";
const QA_ID = "EVIDENCE_QUALITY";
const COMPONENT_ID = "COMPONENT_COMPARISON";
const ORDER = Object.freeze([QA_ID,SLOT_ID,PHASE_ID,COMPONENT_ID]);
const SAFETY = "EVIDENCE_REVIEW_ONLY_NOT_HARDWARE_RISK_OR_FAILURE_SEVERITY";
const issueHint = item => {
  if(item.kind===QA_ID)return "Explicar fuente de datos, frecuencia, timestamps, unidad y semántica, o conservar limitación abierta.";
  if(item.kind===SLOT_ID)return "Verificar variante, mapeo OEM y observabilidad. No inferir avería.";
  if(item.kind===PHASE_ID)return "Validar ventana declarada/observada y asignación de frames.";
  if(item.interpretationGate==="UNRESOLVED")return "No interpretar físicamente; verificar canal, calidad y slot.";
  return "Contrastar magnitudes con fase, actividad, posición/velocidad, cobertura y semántica del estimador.";
};
function lane(item){
  if(item.kind===QA_ID)return "01_DATA_SEMANTICS";
  if(item.kind===SLOT_ID)return "02_OEM_MAPPING";
  if(item.kind===PHASE_ID)return "03_CAPTURE_WINDOWS";
  if(item.interpretationGate==="UNRESOLVED")return "04_COMPARISONS_UNRESOLVED";
  return "05_COMPARISONS_DESCRIPTIVE";
}
function completeness(item) {
  return item.kind===COMPONENT_ID &&
    (item.interpretationGate==="UNRESOLVED" ||
      typeof item.observed?.coverage!=="number" ||
      item.observed.coverage<0.5) ? "EVIDENCE_LIMITATION_REVIEW" : "STANDARD_EVIDENCE_REVIEW";
}
export function buildG1ReviewWorklist({ledger,subsystems}){
  if(ledger?.schemaVersion!=="elaris-g1-findings-ledger/v01" ||
    ledger.classification!=="SENSITIVE" || ledger.exportApproval!=="NOT_APPROVED" ||
    ledger.reviewStatus!=="REVIEW_PENDING" ||
    !Array.isArray(ledger.items) ||
    subsystems?.schemaVersion!=="elaris-g1-subsystem-evidence/v01" ||
    subsystems.exportApproval!=="NOT_APPROVED" ||
    !Array.isArray(subsystems.rows)||subsystems.rows.length!==21)
    throw new Error("Invalid private G1 worklist inputs");
  const rows=[],seen=new Set(),counts={};
  for(const item of ledger.items){
    if(seen.has(item.claimId)||!item.claimId)throw new Error("Duplicated/missing claim ID");
    seen.add(item.claimId);
    if(!ORDER.includes(item.kind))throw new Error("Unsupported worklist claim class");
    if(item.equipmentHealthAssessment!=="NOT_ASSESSED" ||
      item.reviewerStatus!=="REVIEW_PENDING")
      throw new Error("Review worklist cannot infer approval");
    const group=lane(item);
    counts[group]=(counts[group]??0)+1;
    rows.push({
      claimId:item.claimId,kind:item.kind,lane:group,
      reviewReason:completeness(item),
      phaseId:item.phaseId??null,
      componentId:item.componentId??null,
      componentName:item.componentName??null,
      oemIndex:item.oemIndex??null,
      code:item.code??null,
      signal:item.signal??null,
      sourceRefs:[...item.sourceRefs],
      observation:item.observed??null,
      methodologicalLimit:item.limitation,
      interpretation:item.interpretation,
      nextVerification:item.followUp,
      reviewQuestion:issueHint(item),
      reviewDecision:"PENDING_HUMAN_REVIEW",
      humanReviewer:null,reviewedAt:null,technicalNotes:null,
      physicalRiskRanking:"NOT_ASSESSED",
      exportApproval:"NOT_APPROVED"
    });
  }
  rows.sort((a,b)=>a.lane.localeCompare(b.lane)||
    String(a.phaseId??"").localeCompare(String(b.phaseId??""))||
    (a.oemIndex??-1)-(b.oemIndex??-1)||
    a.claimId.localeCompare(b.claimId));
  return {
    schemaVersion:"elaris-g1-private-review-worklist/v01",
    classification:"SENSITIVE",exportApproval:"NOT_APPROVED",
    sourceReportSha256:ledger.sourceReportSha256,
    analysisId:ledger.analysisId,
    humanReview:"PENDING",safetySemantics:SAFETY,
    claimCount:rows.length,counts,subsystemComparisonRows:subsystems.rows.length,
    rows
  };
}
export function g1ReviewMemo(w){
  if(w?.schemaVersion!=="elaris-g1-private-review-worklist/v01")throw new Error("Invalid worklist");
  const lines=[
    "# Elaris G1 — Orden de revisión técnica del informe integral",
    "",
    "**SENSITIVE · USO PRIVADO · REVISIÓN HUMANA PENDIENTE · NO APROBADO PARA EXPORTAR**",
    "",
    "Este documento es un índice de revisión, NO un informe de fallas ni una aprobación.",
    "La prioridad es calidad de evidencia, nunca seguridad, criticidad o severidad mecánica.",
    "",
    "## Estado automático",
    "",
    "- Claims indexados: "+w.claimCount,
    "- Comparaciones fase × subsistema: "+w.subsystemComparisonRows,
    "- Decisiones humanas documentadas: 0 (ninguna se establece mediante generación)",
    "- Estado: PENDING_HUMAN_REVIEW",
    "",
    "## Grupos de trabajo (orden recomendado)",
    ""
  ];
  const descriptions={
    "01_DATA_SEMANTICS":"Corregir/delimitar la captura, duplicados, valores constantes y semántica OEM. Cada código de calidad representa una categoría, no averías.",
    "02_OEM_MAPPING":"Tratar los slots no resueltos por fase sin atribución de fallo físico.",
    "03_CAPTURE_WINDOWS":"Reconciliar fases, actividad declarada, ventana observada y contadores externos de captura.",
    "04_COMPARISONS_UNRESOLVED":"Separar observación numérica de interpretación físicamente sustentada.",
    "05_COMPARISONS_DESCRIPTIVE":"Revisar datos comparables y contexto operacional sin convertir amplitud en severidad."
  };
  for(const id of Object.keys(descriptions)){
    lines.push("### "+id+" — "+(w.counts[id]??0)+" claims");
    lines.push(descriptions[id]);
    lines.push("");
  }
  lines.push("## Preguntas transversales que exigen criterio humano");
  for(const item of [
    "¿Qué versión/variante exacta del G1 y qué documentación OEM respaldan el mapeo de índices?",
    "¿Qué significa realmente cada canal de temperatura, tensión, motorstate y torque estimado?",
    "¿Cómo se reconcilian captura completa, asignaciones a ocho fases y ventanas declaradas/observadas sin asumir pérdidas?",
    "¿Los duplicados de timestamp nacen en recepción, en normalización o en el registro?",
    "¿RightWristYaw tiene señal constante por configuración/observabilidad o existe evidencia independiente de movimiento?",
    "¿Las diferencias respecto de IDLE_BASELINE están presentadas con contexto, unidades y calidad de señal?",
    "¿Las actuaciones/órdenes y sus códigos de respuesta se separan de movimiento físico verificado?",
    "¿La narrativa dice qué demuestran y qué no demuestran los datos, con fuente y nivel de confianza?",
    "¿Se revisaron formato, páginas, escalas, unidades y exactitud de cada figura del PDF?"
  ])lines.push("- [ ] "+item);
  lines.push("","## Procedimiento seguro","");
  lines.push("Revisar el anexo privado review-worklist.csv y las referencias a source V0.3.");
  lines.push("Registrar decisiones en una copia de trabajo privada, con revisor y fecha; nunca declarar aprobado por omisión.");
  lines.push("Si un claim queda sin resolver, documentar la limitación y la prueba discriminante; el informe interno puede declarar incertidumbres.");
  lines.push("El propietario de datos conserva decisión independiente sobre uso externo de versiones y destinatarios.");
  lines.push("","**Este paquete no contiene una firma ni concede autorización alguna.**");
  return lines.join("\n")+"\n";
}
export function g1WorklistCsv(w){
  const cols=["claimId","reviewLane","kind","phaseId","oemIndex","componentName","qualityCode",
    "sourceRefs","reviewQuestion","nextVerification","reviewDecision","humanReviewer","reviewedAt","technicalNotes"];
  const quote=v=>{
    const str=v==null?"":typeof v==="string"?v:JSON.stringify(v);
    const safe=/^\s*[=+@-]/.test(str)?"'"+str:str;
    return '"'+safe.replace(/"/g,'""')+'"';
  };
  const lines=[cols,...w.rows.map(r=>[
    r.claimId,r.lane,r.kind,r.phaseId,r.oemIndex,r.componentName,r.code,
    r.sourceRefs.join(";"),r.reviewQuestion,r.nextVerification,r.reviewDecision,
    r.humanReviewer,r.reviewedAt,r.technicalNotes
  ])];
  return lines.map(row=>row.map(quote).join(",")).join("\n")+"\n";
}

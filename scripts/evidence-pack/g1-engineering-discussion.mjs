// Drafts a local scientific discussion from VERIFIED V0.3 and reviewed-for-integrity annexes.
// Never decides robot health, failure severity, safety, certification, or export authorization.
const ok = x => typeof x==="number" && Number.isFinite(x);
const v = x => ok(x) ? Number(x.toFixed(5)).toString() : "NO DISPONIBLE";
const clean = x => String(x ?? "NO DISPONIBLE").replace(/[\r\n|]/g," ").slice(0,160);
function evidenceFor(joint,signal){
  const s=joint.signals?.[signal]?.summary;
  const c=joint.comparisonsToIdle?.[signal];
  if(joint.slotStatus!=="OBSERVED_USABLE"||
    joint.signals?.[signal]?.semanticsStatus!=="NORMALIZED_OBSERVATION"||
    !s||!ok(s.coverage)||s.coverage<=0||!ok(c?.absP95Delta))
    return "SIN CONTRASTE INTERPRETABLE";
  return "Δ absP95 "+v(c.absP95Delta)+"; cobertura "+v(s.coverage*100)+
    "%; unidad fuente "+clean(s.unit??"NO VALIDADA")+
    "; semántica "+clean(joint.signals[signal].semanticsStatus);
}
function relatedSignals(phase,item){
  const joint=phase.components.find(x=>x.oemIndex===item.oemIndex);
  if(!joint||joint.componentId!==item.componentId)
    throw new Error("Engineering discussion component source reference mismatch");
  return "OEM "+item.oemIndex+" / "+clean(item.componentName)+
    ": cambio en torque ESTIMADO ΔabsP95 "+v(item.signedDelta)+
    ", cobertura "+v(item.coverage*100)+"%. Posición: "+evidenceFor(joint,"joint.position")+
    ". Velocidad: "+evidenceFor(joint,"joint.velocity")+
    ". Fuente V0.3: "+clean(item.sourceRef)+".";
}
export function buildG1EngineeringDiscussion({source,ledger,subsystems}){
  if(source?.phases?.length!==8||!source.phases.some(x=>x.phaseId==="IDLE_BASELINE")||
    ledger?.reviewStatus!=="REVIEW_PENDING"||ledger?.exportApproval!=="NOT_APPROVED"||
    !Array.isArray(ledger.items)||subsystems?.humanReview!=="PENDING"||
    subsystems?.exportApproval!=="NOT_APPROVED"||subsystems?.rows?.length!==21)
    throw new Error("Engineering discussion requires verified, pending-review source and annexes");
  const md=[
    "# Elaris G1 — Discusión técnica preliminar por fase y subsistema",
    "",
    "SENSITIVE / LOCAL ONLY / SCIENTIFIC REVIEW PENDING / NOT APPROVED FOR EXPORT",
    "",
    "Este texto automático aporta una estructura de lectura y cifras descriptivas. No constituye revisión científica, certificación, diagnóstico, declaración de salud, estimación de vida útil ni validación de seguridad.",
    "",
    "## Método y límites",
    "",
    "La referencia es IDLE_BASELINE de la MISMA sesión. Se contrastan agregados V0.3, NO series temporales crudas ni estudios repetidos. Cambios de absP95 del canal torque ESTIMADO no son umbrales OEM ni pruebas de fallos físicos. Se informan posición/velocidad como contexto cuando hay muestras comparables, no como prueba independiente de ejecución de órdenes.",
    "",
    "Estado del registro de sesión observada: "+clean(source.run?.inputs?.observed?.sessionState)+". La integridad verificada del archivo no implica que la captura se haya FINALIZED de forma ordenada. Los frames preservados en origen y los asignados a fases deben reconciliarse con el manifiesto y los timestamps originales; ninguna diferencia de contadores demuestra pérdida por sí sola. La variante OEM y los códigos de estado requieren confirmación documental.",
    "",
    "## Cronología y calidad por fase",""
  ];
  for(const phase of source.phases){
    const q=source.quality?.phaseQuality?.find(x=>x.phaseId===phase.phaseId);
    if(!q)throw new Error("Missing quality row for engineering discussion");
    md.push("### "+clean(phase.phaseId),
      "Frames asignados: "+clean(phase.frameCount)+
      "; inicio declarado: "+clean(phase.declaredStart)+
      "; inicio observado: "+clean(phase.observedTelemetryStart)+
      "; fin declarado: "+clean(phase.declaredEnd)+
      "; fin observado: "+clean(phase.observedTelemetryEnd)+".",
      "Desfase inicial (ms): "+v(q.observedStartLagMs)+
      "; desfase final (ms): "+v(q.observedEndGapMs)+
      "; timestamps duplicados en señales: "+clean(q.duplicateSignalSampleCount)+
      "; canales de baja cobertura: "+clean(q.lowCoverageSignalCount)+".",
      "Pendiente: explicar límites del colector, reglas de asignación y significado de discontinuidades sin presumir avería.","");
  }
  md.push("## Comparaciones operacionales agrupadas","");
  const ids=["LEGS","WAIST","UPPER"],work=source.phases.filter(x=>x.phaseId!=="IDLE_BASELINE");
  for(const phase of work){
    md.push("### "+clean(phase.phaseId),"",
      "Pregunta técnica: ¿qué cambia frente al reposo durante esta actividad y qué evidencia adicional es comparable?","");
    for(const id of ids){
      const r=subsystems.rows.find(x=>x.phaseId===phase.phaseId&&x.groupId===id);
      if(!r)throw new Error("Missing phase/group engineering comparison");
      md.push("#### "+clean(r.groupLabel),
        "Articulaciones comparables: "+r.comparableSlots+"/"+r.expectedSlots+
        "; excluidas: "+r.excludedSlots+
        "; mediana del cambio firmado en absP95 torque estimado: "+v(r.medianSignedDelta)+
        ". Esta mediana NO equivale a carga total, riesgo ni salud del subsistema.");
      if(r.excluded.length)md.push("Exclusiones de interpretación: "+
        r.excluded.map(x=>"OEM "+x.oemIndex+" ("+clean(x.reason)+")").join("; ")+".");
      const inc=(r.topPositive??[]).filter(x=>ok(x.signedDelta)&&x.signedDelta>0);
      const dec=(r.topNegative??[]).filter(x=>ok(x.signedDelta)&&x.signedDelta<0);
      if(!inc.length)md.push("No hay incrementos positivos comparables.");
      else for(const x of inc.slice(0,3))md.push("- INCREMENTO DESCRIPTIVO: "+relatedSignals(phase,x));
      if(!dec.length)md.push("No hay descensos negativos comparables.");
      else for(const x of dec.slice(0,2))md.push("- DESCENSO DESCRIPTIVO: "+relatedSignals(phase,x));
      md.push("Interpretación provisional: diferencias observadas durante actividades no equivalentes al reposo. No se demuestran causalidad, normalidad, adecuación, falla ni severidad.",
        "Siguiente paso humano: verificar contexto operacional, semántica OEM, calidad y unidades contra las fuentes trazadas.","");
    }
  }
  md.push("## Preguntas abiertas que bloquean conclusiones más fuertes","",
    "1. Confirmar variante G1, configuración y mapeo OEM real.",
    "2. Distinguir slot RightWristYaw sin resolver de un diagnóstico de falla.",
    "3. Investigar timestamps duplicados en adquisición, normalización o almacenamiento.",
    "4. Reconciliar frames preservados frente a ventanas de fase, sin usar un denominador fijo.",
    "5. Separar comandos, respuestas SDK y movimiento verificado observacionalmente.",
    "6. Contextualizar posición, velocidad, torque estimado, unidades y cobertura por actividad.",
    "",
    "## Conclusión provisional permitida","",
    "Los datos V0.3 soportan un inventario reproducible de telemetría y comparaciones descriptivas por fase frente al reposo de la misma sesión. No sostienen diagnóstico de salud del robot, calibración OEM, garantía de seguridad, vida útil ni causalidad de valores no resueltos.",
    "",
    "Claims estructurados disponibles para revisión humana: "+ledger.items.length+
    "; filas fase/subsistema: "+subsystems.rows.length+".",
    "Los revisores deben registrar fuentes, límites y decisión técnica; ninguna conclusión queda aprobada automáticamente.",
    "",
    "END / HUMAN REVIEW PENDING / NOT APPROVED FOR EXPORT","");
  return {schemaVersion:"elaris-g1-engineering-discussion/v01",
    classification:"SENSITIVE",exportApproval:"NOT_APPROVED",
    humanReviewStatus:"PENDING",operationalPhases:7,groupSections:21,
    markdown:md.join("\n")};
}

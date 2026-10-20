// Pure, deterministic interpretive ledger for VERIFIED V0.3 evidence.
// Source and generated real outputs are SENSITIVE and must remain private.
import { createHash } from "node:crypto";
const hash = s => createHash("sha256").update(s).digest("hex").slice(0,16);
const finite = n => typeof n==="number" && Number.isFinite(n);
const ACTIONS = Object.freeze({
  PHASE_NO_OBSERVED_TELEMETRY:"Verificar colector y límites de fase.",
  PHASE_OBSERVATION_STARTS_AFTER_DECLARED_START:"Conciliar inicio declarado con observado.",
  PHASE_OBSERVATION_ENDS_BEFORE_DECLARED_END:"Conciliar última muestra con fin declarado.",
  MISSING_COMPONENT_SLOTS:"Validar configuración de slots y disponibilidad.",
  LOW_SIGNAL_COVERAGE:"Revisar timestamps, continuidad y denominador.",
  DUPLICATE_SIGNAL_TIMESTAMP:"Auditar SDK, recepción y persistencia de timestamps.",
  TELEMETRY_FRAME_GAP:"Comparar secuencia del colector y ventanas de fase.",
  CONSTANT_ZERO_SIGNAL:"Validar semántica OEM y observación bajo prueba autorizada.",
  UNRESOLVED_COMPONENT_SLOT:"Contrastar variante/mapeo OEM y ensayo supervisado.",
  OEM_SEMANTICS_UNCONFIRMED:"Verificar unidades/códigos en documentación OEM aplicable."
});
function claim(x) {
  const key=[x.kind,x.phaseId??"",x.oemIndex??"",x.signal??"",x.code??""].join("|");
  return {claimId:"G1-"+hash(key),evidenceClass:"DERIVED",
    equipmentHealthAssessment:"NOT_ASSESSED",faultSeverity:"NOT_ASSESSED",
    reviewerStatus:"REVIEW_PENDING",...x};
}
export function buildG1FindingsLedger(source, sourceSha256) {
  if(!Array.isArray(source?.phases)||source.phases.length!==8)
    throw new Error("Expected eight V0.3 phases");
  if(!/^[a-f0-9]{64}$/i.test(sourceSha256??""))
    throw new Error("Verified source digest required");
  const result=[], phases=source.phases, idle=phases.find(p=>p.phaseId==="IDLE_BASELINE");
  if(!idle)throw new Error("Same-session baseline missing");
  for(let i=0;i<phases.length;i++){
    const p=phases[i], q=(source.quality?.phaseQuality||[]).find(q=>q.phaseId===p.phaseId);
    result.push(claim({kind:"PHASE_OBSERVATION",phaseId:p.phaseId,
      observed:{framesAssignedToPhase:p.frameCount,declaredStart:p.declaredStart,
        declaredEnd:p.declaredEnd,observedStart:p.observedTelemetryStart,
        observedEnd:p.observedTelemetryEnd,observedEndGapMs:q?.observedEndGapMs??null},
      interpretation:"Ventanas observadas y declaradas no son equivalentes automáticamente.",
      alternativeExplanations:["Fases declaradas","Límites de colector","Reglas de asignación"],
      limitation:"Frames asignados no demuestran por sí mismos integridad total.",
      followUp:"Conciliar límites del manifest y secuencia de frames.",
      sourceRefs:["/phases/"+i,"/quality/phaseQuality"]}));
    for(let j=0;j<p.components.length;j++){
      const c=p.components[j],base="/phases/"+i+"/components/"+j;
      if(c.slotStatus==="OBSERVED_UNRESOLVED_SLOT"){
        result.push(claim({kind:"UNRESOLVED_SLOT",phaseId:p.phaseId,
          componentId:c.componentId,componentName:c.componentName,oemIndex:c.oemIndex,
          observed:{slotStatus:c.slotStatus},
          interpretation:"El slot no tiene identidad o semántica operacional resuelta.",
          alternativeExplanations:["Variante OEM","Configuración","Canal inactivo"],
          limitation:"No demuestra avería, disponibilidad ni salud física.",
          followUp:"Verificar variante y mapeo antes de un ensayo supervisado autorizado.",
          sourceRefs:[base+"/slotStatus"]}));
      }
      if(p.phaseId==="IDLE_BASELINE")continue;
      const x=c.comparisonsToIdle?.["joint.torque_estimate"],
        s=c.signals?.["joint.torque_estimate"];
      if(!x||!s?.summary||!finite(x.absP95Delta)||!finite(s.summary.absP95))
        continue;
      const resolved=c.slotStatus==="OBSERVED_USABLE"&&
        s.semanticsStatus==="NORMALIZED_ESTIMATE";
      result.push(claim({kind:"COMPONENT_COMPARISON",phaseId:p.phaseId,
        componentId:c.componentId,componentName:c.componentName,oemIndex:c.oemIndex,
        signal:"joint.torque_estimate",
        observed:{phaseAbsP95:s.summary.absP95,
          idleAbsP95:finite(x.baselineAbsP95)?x.baselineAbsP95:null,
          signedAbsP95Delta:x.absP95Delta,
          absP95Ratio:finite(x.absP95Ratio)?x.absP95Ratio:null,
          coverage:finite(s.summary.coverage)?s.summary.coverage:null,
          samples:Number.isSafeInteger(s.summary.samples)?s.summary.samples:null,
          semanticsStatus:s.semanticsStatus,slotStatus:c.slotStatus},
        comparisonReference:"SAME_SESSION_IDLE_PRIMARY",
        interpretation:resolved?"Comparación descriptiva del torque ESTIMADO respecto del reposo de la misma sesión.":
          "Contraste numérico presente, pero el slot o la semántica sigue sin resolverse.",
        alternativeExplanations:["Actividad distinta del reposo","Contexto de operación",
          "Limitaciones del estimador"],
        limitation:"No es diagnóstico, desgaste, umbral OEM ni prueba de movimiento ejecutado.",
        followUp:resolved?"Contrastar posición/velocidad y calidad bajo la misma fase.":
          "Confirmar semántica/slot antes de interpretar físicamente.",
        interpretationGate:resolved?"DESCRIPTIVE_ONLY":"UNRESOLVED",
        sourceRefs:[base+"/comparisonsToIdle/joint.torque_estimate",
          base+"/signals/joint.torque_estimate/summary"]}));
    }
  }
  const grouped=new Map();
  for(let i=0;i<(source.quality?.findings||[]).length;i++){
    const f=source.quality.findings[i];
    if(!f?.code)continue;
    const g=grouped.get(f.code)??{count:0,bySeverity:{},examples:[]};
    g.count++;g.bySeverity[f.severity]=(g.bySeverity[f.severity]??0)+1;
    if(g.examples.length<3)g.examples.push("/quality/findings/"+i);
    grouped.set(f.code,g);
  }
  for(const [code,g] of [...grouped].sort((a,b)=>a[0].localeCompare(b[0]))){
    result.push(claim({kind:"EVIDENCE_QUALITY",code,
      observed:{findingRecords:g.count,severityLabels:g.bySeverity,sampleEvidenceRefs:g.examples},
      interpretation:"Hallazgos de calidad o semántica, NO averías del robot.",
      alternativeExplanations:["Instrumentación","Marcadores de fase","Canales OEM"],
      limitation:"WARNING no implica riesgo físico ni severidad de falla.",
      followUp:ACTIONS[code]??"Revisar registros y fuente antes de cualquier atribución.",
      interpretationGate:"QUALITY_NOT_HARDWARE",sourceRefs:["/quality/findings"]}));
  }
  if(new Set(result.map(x=>x.claimId)).size!==result.length)
    throw new Error("Duplicate finding claim ID");
  return {schemaVersion:"elaris-g1-findings-ledger/v01",
    classification:"SENSITIVE",exportApproval:"NOT_APPROVED",
    sourceReportSha256:sourceSha256.toLowerCase(),analysisId:source.run?.analysisId??null,
    methodology:"DESCRIPTIVE_OPERATIONAL_EVIDENCE",
    reviewStatus:"REVIEW_PENDING",requiresHumanReview:true,noDiagnostics:true,
    items:result};
}

#!/usr/bin/env node
// LOCAL / SENSITIVE / NOT APPROVED FOR EXPORT. Development report, not a release.
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { inspectPack, validatePrivateOutputTarget, resolvePlaywrightChromium } from "./g1-private-draft.mjs";
import { buildG1FindingsLedger } from "./g1-report-findings.mjs";
import { analyzeG1Subsystems } from "./g1-report-subsystems.mjs";

const PRIVATE_ROOT = join(homedir(), "elaris-private");
const SIGNALS = [
  "joint.position", "joint.velocity", "joint.torque_estimate",
  "motor.voltage", "motor.temperature.casing", "motor.temperature.winding", "motor.state_code"
];
const LABEL = "SENSITIVE / LOCAL ENGINEERING WORKING DRAFT / NOT APPROVED FOR EXPORT";
const sha = b => createHash("sha256").update(b).digest("hex");
const fmt = (x,d=4) => typeof x === "number" && Number.isFinite(x) ? Number(x.toFixed(d)).toString() : "—";
const val = x => x === undefined || x === null || x === "" ? "—" : String(x);
const esc = x => val(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const csvField = x => {
  const v = x === undefined || x === null ? "" : String(x);
  const safe = typeof x === "number" && Number.isFinite(x) ? v : (/^[\s]*[=+\-@]/.test(v) ? "'" + v : v);
  return '"' + safe.replace(/"/g,'""') + '"';
};
const csv = rows => rows.map(row=>row.map(csvField).join(",")).join("\n")+"\n";
const tab = (headers,rows) => "<table><thead><tr>"+headers.map(x=>"<th>"+esc(x)+"</th>").join("")+"</tr></thead><tbody>"+
  rows.map(row=>"<tr>"+row.map(x=>"<td>"+esc(x)+"</td>").join("")+"</tr>").join("")+"</tbody></table>";
const p = text => "<p>"+esc(text)+"</p>";
const h = (level,title) => "<h"+level+">"+esc(title)+"</h"+level+">";
const svgBars=(title,rows)=>{
  const valid=rows.filter(r=>typeof r[1]==="number"&&Number.isFinite(r[1])&&r[1]>0).slice(0,8);
  if(!valid.length)return p("No hay incrementos positivos medidos aptos para graficar.");
  const max=Math.max(...valid.map(r=>r[1]));
  const ht=78+valid.length*33;
  const rects=valid.map((r,i)=>{
    const y=62+i*33;
    const w=Math.max(1,Math.round(615*r[1]/max));
    return '<text x="18" y="'+(y+17)+'" font-size="13">'+esc(r[0])+'</text>'+
      '<rect x="320" y="'+(y+3)+'" width="'+w+'" height="20" fill="#31618a" />'+
      '<text x="'+(330+w)+'" y="'+(y+18)+'" font-size="12">'+fmt(r[1],4)+'</text>';
  }).join("");
  return '<figure class="signal-plot"><svg viewBox="0 0 1020 '+ht+'" role="img" aria-label="'+esc(title)+'">'+
    '<text x="18" y="28" font-size="19" font-weight="bold">'+esc(title)+'</text>'+rects+
    '</svg><figcaption>Cambios absolutos descriptivos de absP95 de torque estimado respecto de IDLE_BASELINE; no son fallas ni umbrales.</figcaption></figure>';
};
function fail(msg){throw new Error("G1 comprehensive local draft: "+msg);}

/**
 * Structural and semantic checks for a truthful analytical dossier.
 * This validates the SOURCE MODEL only, never diagnoses physical equipment.
 * Missing numerical fields are allowed; invalid present fields are rejected.
 */
function validateReportEvidence(source) {
  const phases = source.phases;
  if (!Array.isArray(phases) || phases.length !== 8) fail("Expected 8 phases");
  const phaseIds = new Set(), identities = new Map();
  const numericFields = [
    "coverage", "min", "p05", "mean", "p50", "p95", "max",
    "absP95", "first", "last", "delta", "transitions"
  ];
  const comparisonFields = [
    "baselineMean", "observedMean", "meanDelta",
    "baselineP95", "observedP95", "p95Delta",
    "baselineAbsP95", "observedAbsP95", "absP95Delta",
    "absP95Ratio", "rangeDelta"
  ];
  for (const phase of phases) {
    if (!phase?.phaseId || phaseIds.has(phase.phaseId)) fail("Missing or duplicate phase ID");
    phaseIds.add(phase.phaseId);
    if (!Array.isArray(phase.components) || phase.components.length !== 29) fail("Expected 29 slots");
    const localSlots = new Set();
    for (const comp of phase.components) {
      const idx = comp?.oemIndex;
      if (!Number.isInteger(idx) || idx < 0 || idx >= 29 || localSlots.has(idx))
        fail("Duplicate or invalid OEM index in " + phase.phaseId);
      localSlots.add(idx);
      const id = String(comp.componentId ?? "");
      const name = String(comp.componentName ?? "");
      if (!id.trim() || !name.trim()) fail("Missing component identity in " + phase.phaseId);
      const prior = identities.get(idx);
      if (prior && (prior.id !== id || prior.name !== name))
        fail("Inconsistent component identity across phases for OEM " + idx);
      identities.set(idx, {id,name});
      for (const signal of SIGNALS) {
        const entry = comp.signals?.[signal];
        if (!entry || typeof entry !== "object") fail("Missing signal " + signal + " in " + phase.phaseId);
        const s = entry.summary;
        if (s == null) continue; // unobserved is NOT zero
        if (typeof s !== "object") fail("Invalid signal summary in " + phase.phaseId);
        for (const field of numericFields) {
          const v = s[field];
          if (v != null && (typeof v !== "number" || !Number.isFinite(v)))
            fail("Invalid summary number: " + field + " in " + phase.phaseId);
        }
        if (s.coverage != null && (s.coverage < 0 || s.coverage > 1))
          fail("Signal coverage out of range");
        for (const field of ["samples", "uniqueTimestamps"]) {
          const v = s[field];
          if (v != null && (!Number.isSafeInteger(v) || v < 0))
            fail("Invalid " + field + " in " + phase.phaseId);
        }
        if (s.samples != null && s.uniqueTimestamps != null && s.uniqueTimestamps > s.samples)
          fail("More unique timestamps than samples in " + phase.phaseId);
        const cmp = comp.comparisonsToIdle?.[signal];
        if (cmp == null) continue;
        if (typeof cmp !== "object") fail("Invalid idle comparison");
        for (const field of comparisonFields) {
          const v=cmp[field];
          if (v != null && (typeof v !== "number" || !Number.isFinite(v)))
            fail("Invalid comparison number: " + field + " in " + phase.phaseId);
        }
      }
    }
  }
  const qa = source.quality?.phaseQuality;
  if (!Array.isArray(qa) || qa.length !== 8) fail("Exactly one QA row required for each phase");
  const qaIds = new Set();
  for (const q of qa) {
    if (!phaseIds.has(q?.phaseId) || qaIds.has(q.phaseId)) fail("Missing or duplicate QA phase");
    qaIds.add(q.phaseId);
  }
  if (identities.size !== 29 || !phaseIds.has("IDLE_BASELINE"))
    fail("Incomplete component or reference matrix");
  return {phases: 8, oemSlots: 29, phaseSlots: 232, signalRows: 1624};
}

function analyze(source, findingsLedger, subsystemEvidence) {
  validateReportEvidence(source);
  if(!Array.isArray(source.phases) || source.phases.length!==8) fail("Expected eight observed phases");
  const phases=source.phases, seenPhases=new Set();
  const jointIds=new Map(),signalRows=[],qualityRows=[],findingRows=[];
  let totalFrames=0;
  const section=[];
  const codeCounts=new Map();
  for(const f of source.quality.findings){
    const key=f.code;
    codeCounts.set(key,(codeCounts.get(key)||0)+1);
    findingRows.push([f.code,f.severity,f.phaseId||"",f.componentId||"",f.signal||"",f.message||"",JSON.stringify(f.details||{})]);
  }
  for(const phase of phases) {
    if(seenPhases.has(phase.phaseId))fail("Duplicated phase");
    seenPhases.add(phase.phaseId);
    if(phase.components.length!==29)fail("Expected 29 joint slots in "+phase.phaseId);
    totalFrames+=phase.frameCount;
    const byIndex=new Set();
    for(const c of phase.components) {
      if(!Number.isInteger(c.oemIndex)||c.oemIndex<0||c.oemIndex>28||byIndex.has(c.oemIndex)) fail("Invalid/duplicated joint index");
      byIndex.add(c.oemIndex);
      jointIds.set(c.oemIndex,{id:c.componentId,name:c.componentName});
      for(const signal of SIGNALS) {
        const entry=c.signals?.[signal];
        if(!entry) fail("Missing signal contract "+signal);
        const s=entry.summary;
        const compare=c.comparisonsToIdle?.[signal]||null;
        if(s && (!Number.isFinite(s.mean)||!Number.isFinite(s.coverage)||s.coverage<0||s.coverage>1+1e-9))
          fail("Bad signal statistics in "+phase.phaseId);
        signalRows.push([c.oemIndex,c.componentId,c.componentName,phase.phaseId,c.slotStatus,c.availability,signal,entry.semanticsStatus,
          s?.unit,s?.samples,s?.uniqueTimestamps,s?.coverage,s?.quality,s?.min,s?.p05,s?.mean,s?.p50,s?.p95,s?.max,s?.absP95,
          s?.first,s?.last,s?.delta,s?.observedValues?.join(";"),s?.transitions,
          compare?.baselineMean,compare?.observedMean,compare?.meanDelta,compare?.baselineP95,compare?.observedP95,compare?.p95Delta,
          compare?.baselineAbsP95,compare?.observedAbsP95,compare?.absP95Delta,compare?.absP95Ratio,compare?.rangeDelta,
          c.newStateCodesVsIdle?.join(";")]);
      }
    }
  }
  if(!seenPhases.has("IDLE_BASELINE")||jointIds.size!==29||signalRows.length!==29*8*7)
    fail("Incomplete evidence matrix");
  for(const q of source.quality.phaseQuality) {
    qualityRows.push([q.phaseId,q.declaredDurationMs,q.observedDurationMs,q.observedStartLagMs,q.observedEndGapMs,
      q.missingComponentSlots,q.lowCoverageSignalCount,q.duplicateSignalSampleCount,q.maxCoverage,
      q.medianInterFrameGapMs,q.maxInterFrameGapMs]);
  }
  section.push(h(1,"ELARIS — Unitree G1: informe tecnico completo por fase y articulacion"));
  section.push(p(LABEL));
  section.push(p("Clasificacion SENSITIVE. Borrador de desarrollo: ninguna autorizacion del titular es afirmada por este proceso. No reenviar a terceros."));
  section.push(p("Evidencia descriptiva observada. No diagnostico, vida remanente, puntuacion de salud, certificacion, decision de seguridad, ni seguro."));
  section.push(h(2,"1. Identidad y alcance"));
  section.push(tab(["Campo","Valor"],[
    ["Analisis",source.run.analysisId],["Esquema",source.schemaVersion],["Motor",source.run.engineVersion],
    ["Robot",source.robot.manufacturer+" "+source.robot.model],["Slots catalogo",source.robot.componentSlots],
    ["Regla de referencia",source.reference.rule],["Historico","SECONDARY_CONTEXT_ONLY"],
    ["Estado observado",source.run.inputs.observed.sessionState],["Tipo copia",source.run.inputs.observed.workingCopyKind],
    ["Equivalencia plaintext",source.run.inputs.observed.plaintextEquivalence],
    ["Aprobacion externa","NOT APPROVED"]
  ]));
  section.push(h(2,"2. Cronologia completa y control de integridad"));
  section.push(tab(["Fase","Frames","Inicio/fin declarados","Inicio/fin observados","Slots"],phases.map(x=>[
    x.phaseId,x.frameCount,x.declaredStart+" / "+x.declaredEnd,val(x.observedTelemetryStart)+" / "+val(x.observedTelemetryEnd),
    x.observedComponentCount+"/"+x.componentSlots
  ])));
  section.push(p("Frames asignados a fases: "+totalFrames+". El registro historico de Dataset 002 indica 15000 frames preservados. Diferencia: "+
    (15000-totalFrames)+". No equivale automaticamente a perdida o corrupcion; requiere revisar ventanas y denominadores."));
  section.push(h(2,"3. Semantica de señales y metodo"));
  section.push(p("Datos por joint y fase: seven familias de señales del V0.3, estadistica descriptiva, cobertura, calidad y comparacion con reposo de la MISMA sesion."));
  section.push(p("Un ratio de torque estimado no es probabilidad de riesgo ni diagnostico. Los canales voltage/state code requieren verificacion semantica OEM."));
  section.push(tab(["Canal","Precaucion"],SIGNALS.map(s=>[s,
    s==="motor.state_code"?"Codigo OEM sin enum validado":s==="joint.torque_estimate"?"Estimacion no calibrada":s.startsWith("motor.")?"Confirmar semanticas y umbrales OEM":"Observacion normalizada no prueba salud"])));
  section.push(h(2,"4. Calidad y limitaciones"));
  section.push(tab(["Codigo","Registros"],[...codeCounts.entries()].sort((a,b)=>b[1]-a[1])));
  section.push(p("Hallazgos de datos no equivalen a averias. El detalle completo con fase, componente y codigo se encuentra en quality-findings.csv."));
  section.push(h(2,"4.1. Lectura cuantitativa preliminar (sin diagnostico)"));
  section.push(p("Se destacan cambios en absP95 del torque ESTIMADO frente a IDLE_BASELINE de la misma sesion. La tabla ordena diferencias ABSOLUTAS positivas, no solo ratios: un ratio grande con referencia cercana a cero puede ser poco informativo. No define normalidad, riesgo ni causalidad."));
  const highlights=[];
  for(const phase of phases) {
    if(phase.phaseId==="IDLE_BASELINE")continue;
    const rows=(source.operationalFingerprints?.[phase.phaseId]||[])
      .filter(x=>Number.isFinite(x.idleAbsP95)&&Number.isFinite(x.observedAbsP95))
      .map(x=>({name:x.componentName,idle:x.idleAbsP95,observed:x.observedAbsP95,
        delta:x.observedAbsP95-x.idleAbsP95,ratio:x.ratio}))
      .filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta);
    for(const item of rows.slice(0,4)) highlights.push([
      phase.phaseId,item.name,fmt(item.idle),fmt(item.observed),fmt(item.delta),
      Number.isFinite(item.ratio)?fmt(item.ratio):"—"
    ]);
  }
  section.push(highlights.length?tab(["Fase","Articulacion","Idle absP95","Fase absP95","Incremento absoluto","Ratio"],highlights):
    p("No hay comparaciones positivas validas para mostrar."));
  section.push(p("Estos resultados son DESCRIPTIVOS y dependen del contexto operacional y la semantica del canal. No comparar como si todas las fases tuvieran la misma exigencia mecanica."));
  section.push(p("Integridad de la revision pendiente: reconciliar contador de captura frente a asignaciones por fase y validar las unidades/escala OEM antes de usar umbrales."));
  section.push(h(2,"4.2. Comparaciones entre subsistemas (descriptivas, no diagnósticas)"));
  section.push(p("Cada fila corresponde a una fase y un grupo anatómico definido por índices OEM. Solo se comparan componentes observados, con slot utilizable, estimación normalizada y muestra comparable frente al reposo de LA MISMA SESIÓN. Se excluyen explícitamente señales no interpretables; la cantidad comparable no es una nota de salud."));
  section.push(tab(["Fase","Grupo","Componentes comparables","Excluidos","Mediana Δ absP95","Mayor incremento observado","Mayor descenso observado"],
    subsystemEvidence.rows.map(r=>[
      r.phaseId,r.groupLabel,r.comparableSlots+"/"+r.expectedSlots,r.excludedSlots,
      fmt(r.medianSignedDelta),
      r.largestPositive?r.largestPositive.componentName+" ("+fmt(r.largestPositive.signedDelta)+")":"SIN INCREMENTO",
      r.largestNegative?r.largestNegative.componentName+" ("+fmt(r.largestNegative.signedDelta)+")":"SIN DESCENSO"
    ])));
  section.push(p("La mediana representa cambios de magnitud por articulación dentro de este grupo; NO equivale a torque total ni carga mecánica del subsistema. Cada fila tiene trazabilidad de origen y exclusiones en subsystem-evidence.json."));
  section.push(p("La comparación idle-operación no ajusta postura, velocidad, masa/carga ni perturbaciones, por lo que los incrementos no prueban anormalidad. Las unidades y límites OEM no están confirmados universalmente."));
  section.push(h(2,"4.3. Hallazgos trazables para revisión humana"));
  section.push(p("Esta selección editorial procede del registro determinístico findings-ledger.json, que contiene las referencias exactas. No sustituye el análisis de ingeniería humana ni permite inferir averías."));
  const notable = findingsLedger.items
    .filter(x => x.kind==="COMPONENT_COMPARISON" &&
      x.interpretationGate==="DESCRIPTIVE_ONLY" &&
      typeof x.observed?.signedAbsP95Delta==="number" &&
      Number.isFinite(x.observed.signedAbsP95Delta) &&
      x.observed.signedAbsP95Delta>0)
    .sort((a,b)=>b.observed.signedAbsP95Delta-a.observed.signedAbsP95Delta)
    .slice(0,16);
  section.push(tab(["Claim","Fase","Articulación","Δ absP95 torque estimado","Cobertura","Qué significa","Verificación"],notable.map(x=>[
    x.claimId,x.phaseId,x.componentName,fmt(x.observed.signedAbsP95Delta),
    x.observed.coverage==null?"NO OBSERVADO":fmt(x.observed.coverage*100,1)+"%",
    x.interpretation,x.followUp
  ])));
  const unresolvedClaims=findingsLedger.items.filter(x=>x.kind==="UNRESOLVED_SLOT");
  section.push(p("Slots no resueltos: "+unresolvedClaims.length+" observaciones por fase; no son diagnóstico de fallas."));
  section.push(tab(["Claim","Fase","Slot OEM","Interpretación","Siguiente verificación"],unresolvedClaims.map(x=>[
    x.claimId,x.phaseId,x.oemIndex,x.limitation,x.followUp
  ])));
  section.push(p("Todos los hallazgos y la matriz de calidad se conservan en findings-ledger.json con sourceRefs del esquema V0.3. El autor técnico debe revisar y cerrar cada claim relevante antes de difusión."));
  section.push(h(2,"5. Analisis detallado por fase"));
  for(const phase of phases) {
    const q=source.quality.phaseQuality.find(x=>x.phaseId===phase.phaseId)||{};
    const f=source.operationalFingerprints?.[phase.phaseId]||[];
    section.push(h(3,phase.phaseId+" — "+phase.label));
    section.push(tab(["Metrica","Valor"],[
      ["Frames",phase.frameCount],["Eventos numericos joint",phase.jointEventCount],
      ["Timestamps declarados",phase.declaredStart+" / "+phase.declaredEnd],
      ["Ventana observada",val(phase.observedTelemetryStart)+" / "+val(phase.observedTelemetryEnd)],
      ["Lag observado inicio (ms)",q.observedStartLagMs],["Gap final (ms)",q.observedEndGapMs],
      ["Duplicados signal timestamps",q.duplicateSignalSampleCount],
      ["Señales de baja cobertura",q.lowCoverageSignalCount],
      ["Mediana gap frames (ms)",q.medianInterFrameGapMs],["Maximo gap frames (ms)",q.maxInterFrameGapMs]
    ]));
    const deltas=phase.components.map(c=>({name:c.componentName,
      delta:c.comparisonsToIdle?.["joint.torque_estimate"]?.absP95Delta}))
      .filter(x=>Number.isFinite(x.delta)&&x.delta>0)
      .sort((a,b)=>b.delta-a.delta);
    if(phase.phaseId!=="IDLE_BASELINE")
      section.push(svgBars("Variaciones del torque estimado: "+phase.phaseId,
        deltas.slice(0,7).map(x=>[x.name,x.delta])));
    section.push(h(4,"Fingerprints de torque estimado vs reposo"));
    section.push(f.length?tab(["Joint","Idle absP95","Fase absP95","Ratio"],f.map(x=>[
      x.componentName,fmt(x.idleAbsP95),fmt(x.observedAbsP95),fmt(x.ratio)
    ])):p("Sin resultados comparables registrados para esta fase."));
    section.push(p("Los ratios muestran diferencias relativas descriptivas; no son umbrales de aceptacion."));
  }
  section.push(h(2,"6. Dossiers exhaustivos de los 29 componentes"));
  for(const [index,c] of [...jointIds.entries()].sort((a,b)=>a[0]-b[0])){
    section.push(h(3,"OEM "+String(index).padStart(2,"0")+" / "+c.name));
    section.push(p("Component ID: "+c.id+". Las posiciones catalogadas no acreditan actividad ni buen estado fisico."));
    section.push(tab(["Fase","Estado slot","Canal","Cobertura","Muestras","Media","P95","absP95","Delta media reposo","Ratio absP95 reposo"],phases.flatMap(x=>{
      const joint=x.components.find(z=>z.oemIndex===index);
      return SIGNALS.map(signal=>{
        const e=joint.signals[signal],s=e.summary,k=joint.comparisonsToIdle?.[signal];
        return [x.phaseId,joint.slotStatus,signal,s?.coverage==null?"—":fmt(s.coverage*100,2)+"%",
          s?.samples,fmt(s?.mean),fmt(s?.p95),fmt(s?.absP95),fmt(k?.meanDelta),fmt(k?.absP95Ratio)];
      });
    })));
    const statusByPhase=phases.map(x=>x.components.find(z=>z.oemIndex===index)?.slotStatus);
    const unresolved=statusByPhase.filter(x=>x==="OBSERVED_UNRESOLVED_SLOT").length;
    if(unresolved) section.push(p("OBSERVACION NO RESUELTA: "+unresolved+"/"+phases.length+
      " fases conservan OBSERVED_UNRESOLVED_SLOT. La presencia de muestras y 100% de cobertura no valida comportamiento fisico ni diagnostica falla; hace falta discriminar configuracion, OEM mapping y respuesta real bajo prueba autorizada."));
    const comparable=phases.filter(x=>x.phaseId!=="IDLE_BASELINE").map(x=>{
      const joint=x.components.find(z=>z.oemIndex===index);
      const torque=joint?.comparisonsToIdle?.["joint.torque_estimate"];
      const observed=joint?.signals?.["joint.torque_estimate"]?.summary;
      return {phase:x.phaseId,delta:torque?.absP95Delta,level:observed?.absP95};
    }).filter(x=>Number.isFinite(x.delta)&&Number.isFinite(x.level));
    if(comparable.length&&unresolved===0){
      comparable.sort((a,b)=>b.delta-a.delta);
      const peak=comparable[0];
      const direction=peak.delta>0?"mayor incremento":peak.delta===0?"sin incremento positivo":"diferencia menos negativa";
      section.push(p("COMPARACION DESCRIPTIVA: "+direction+" de absP95 en torque estimado frente a reposo durante "+
        peak.phase+" (diferencia con signo "+fmt(peak.delta)+", absP95 de fase "+fmt(peak.level)+
        "). No es indice de desgaste, alarma ni calidad de movimiento."));
    }
    section.push(p("Resultados completos por canal (min/p05/p50/max/first/last/state-code) en component-signals.csv. Datos ausentes no se convierten en cero."));
  }
  section.push(h(2,"7. Registro de preguntas tecnicas abiertas"));
  section.push(tab(["Pregunta","Estado / accion"],[
    ["RightWristYaw index 28","SLOTS UNRESOLVED; discriminar con movimiento autorizado + observacion read-only"],
    ["Timestamps duplicados","Instrumentar SDK callback, bridge, nodo de recepcion y persistencia"],
    ["Gap temporal Recovery Idle","Reconciliar collector lifecycle y limite declarado vs observado"],
    ["Diferencia 88 frames","Reconciliar counters de origen y selecciones por fase"],
    ["motorstate / voltage","Confirmar unidades/codigos en fuente OEM"],
    ["Respuesta 3104","No atribuir causalidad sin validar con API/OEM y evidencia temporal"]
  ]));
  section.push(h(2,"8. Conclusiones permitidas"));
  section.push(p("El analisis V0.3 ofrece evidencia operacional descriptiva de un G1 real y comparaciones contra reposo intra-sesion. Este informe no establece salud mecanica, cumplimiento, seguridad ni causalidad de observaciones no resueltas."));
  section.push(p("Se requiere revision humana de la semantica, coherencia de unidades, definicion de cobertura y trazabilidad antes de cierre tecnico."));
  section.push(h(2,"9. Restricciones de salida"));
  section.push(p("No autorizado para distribucion externa; generar solo en directorio privado, nunca bajo GitHub, Dropbox o carpetas publicas. El estado de una autorizacion externa sigue siendo independiente de esta generacion."));
  return {html:section.join("\n"),phaseRows:phases,signalRows,qualityRows,findingRows,totalFrames};
}
export async function main(argv) {
  if(argv.length<4 || argv[0]!=="--input"||argv[2]!=="--out"||
    (argv.length!==4 && !(argv.length===5&&argv[4]==="--pdf"))) {
    fail("Usage: node scripts/evidence-pack/g1-exhaustive-local-report.mjs --input ABS_V03_JSON --out NEW_ABS_PRIVATE_DIR [--pdf]");
  }
  const input=argv[1],out=argv[3],wantPdf=argv.length===5;
  if(!isAbsolute(input)||!isAbsolute(out))fail("Use absolute paths");
  if(!existsSync(PRIVATE_ROOT)||lstatSync(PRIVATE_ROOT).isSymbolicLink())fail("Invalid local private root");
  const root=realpathSync(PRIVATE_ROOT);
  const {analysis,digest}=inspectPack(input,root);
  const dest=validatePrivateOutputTarget(out,root);
  const findingsLedger=buildG1FindingsLedger(analysis,digest);
  const subsystemEvidence=analyzeG1Subsystems(analysis);
  const report=analyze(analysis,findingsLedger,subsystemEvidence);
  const styled="<html lang='es'><head><meta charset='utf-8'><style>"+
    "body{font:11px/1.55 Arial,sans-serif;color:#18364f;padding:22px}h1{font-size:26px}h2{font-size:19px;color:#234f79;border-bottom:1px solid #bdd0e0;margin-top:24px}h3{font-size:15px;color:#264f6d;margin-top:22px}table{border-collapse:collapse;width:100%;font-size:9px;table-layout:fixed;margin:12px 0 18px}tr{break-inside:avoid}th,td{border-bottom:1px solid #d5dfe8;padding:4px;overflow-wrap:anywhere;text-align:left}th{background:#e7f0f8}figure.signal-plot{max-width:1050px;margin:18px auto 20px;break-inside:avoid}figure.signal-plot svg{width:100%;height:auto;display:block}figcaption{font-size:11px;color:#394c60}@page{size:A4 landscape;margin:13mm}@media print{body{padding:0;font-size:10px}table{font-size:9px}th,td{padding:3px}h2,h3{break-after:avoid}}"+
    "</style></head><body>"+report.html+"</body></html>";
  let pdf=null;
  if(wantPdf) {
    const chromium=await resolvePlaywrightChromium();
    const browser=await chromium.launch({headless:true});
    try{const page=await browser.newPage();await page.setContent(styled,{waitUntil:"load"});
      pdf=await page.pdf({format:"A4",printBackground:true,preferCSSPageSize:true});
    }finally{await browser.close();}
  }
  mkdirSync(dest,{mode:0o700});
  const files={
    "g1-exhaustive-report.html":styled,
    "findings-ledger.json":JSON.stringify(findingsLedger,null,2)+"\n",
    "subsystem-evidence.json":JSON.stringify(subsystemEvidence,null,2)+"\n",
    "subsystem-evidence.csv":csv([["phase","subsystem","expectedSlots","comparableSlots","excludedSlots","medianSignedDelta","topPositiveOEM","topPositiveDelta","topNegativeOEM","topNegativeDelta","status"],...subsystemEvidence.rows.map(r=>[r.phaseId,r.groupId,r.expectedSlots,r.comparableSlots,r.excludedSlots,r.medianSignedDelta,r.largestPositive?.oemIndex,r.largestPositive?.signedDelta,r.largestNegative?.oemIndex,r.largestNegative?.signedDelta,r.status])]),
    "component-signals.csv":csv([["oemIndex","componentId","componentName","phaseId","slotStatus","availability",
      "signal","semanticsStatus","unit","samples","uniqueTimestamps","coverage","quality","min","p05","mean","p50","p95",
      "max","absP95","first","last","delta","stateCodes","transitions","idleMean","observedMean","meanDelta","idleP95",
      "observedP95","p95Delta","idleAbsP95","observedAbsP95","absP95Delta","absP95Ratio","rangeDelta","newStateCodes"],
      ...report.signalRows]),
    "quality-findings.csv":csv([["code","severity","phaseId","componentId","signal","message","details"],...report.findingRows]),
    "phase-quality.csv":csv([["phaseId","declaredDurationMs","observedDurationMs","observedStartLagMs","observedEndGapMs",
      "missingSlots","lowCoverageSignals","duplicateSamples","maxCoverage","medianInterFrameGapMs","maxInterFrameGapMs"],
      ...report.qualityRows])
  };
  const manifest={schemaVersion:"elaris-g1-exhaustive-local-draft/v01",sourceReportSha256:digest,
    analysisId:analysis.run.analysisId,classification:"SENSITIVE",
    exportApproval:"NOT_APPROVED",ownerAuthorizationAsserted:false,
    shareStatus:"LOCAL_ONLY",phases:analysis.phases.length,joints:29,signalRows:report.signalRows.length,
    findings:report.findingRows.length,structuredClaims:findingsLedger.items.length,
    subsystemRows:subsystemEvidence.rows.length,
    humanReview:"PENDING",phaseAllocatedFrames:report.totalFrames,outputs:{}};
  if(pdf)files["g1-exhaustive-report.pdf"]=pdf;
  for(const [name,bytes] of Object.entries(files)){
    const buffer=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes,"utf8");
    writeFileSync(join(dest,name),buffer,{mode:0o600,flag:"wx"});
    manifest.outputs[name]=sha(buffer);
  }
  writeFileSync(join(dest,"manifest.json"),JSON.stringify(manifest,null,2)+"\n",{mode:0o600,flag:"wx"});
  console.log("G1 EXHAUSTIVE LOCAL DRAFT CREATED (SENSITIVE / NO EXPORT)");
  console.log("Phases:",manifest.phases,"Joints:",manifest.joints,"Signal rows:",manifest.signalRows,"QA findings:",manifest.findings);
  console.log("Findings ledger:",manifest.structuredClaims,"claims pending human review");
  console.log("Subsystem comparisons:",manifest.subsystemRows,"rows pending human review");
  console.log("Private output:",dest);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)
  main(process.argv.slice(2)).catch(err=>{console.error(err.message);process.exitCode=1;});

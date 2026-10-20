#!/usr/bin/env node
// G1 private verification & reviewer-queue generator. No robot control/network/export.
// All source data and derived reviewer files stay in $HOME/elaris-private.
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { inspectPack, validatePrivateOutputTarget } from "./g1-private-draft.mjs";
import { analyzeG1Subsystems } from "./g1-report-subsystems.mjs";
import { buildG1ReviewWorklist, g1ReviewMemo, g1WorklistCsv } from "./g1-review-worklist.mjs";
import { buildG1EngineeringDiscussion } from "./g1-engineering-discussion.mjs";

const SHA = x=>createHash("sha256").update(x).digest("hex");
const fail = message=>{ throw new Error("G1 local review audit: "+message); };
const eq = (a,b)=>a===b;
const numericEq = (a,b)=> typeof a==="number"&&typeof b==="number"&&
  Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=Math.max(1e-8,Math.abs(a)*1e-9);
const eligible = n=>typeof n==="number"&&Number.isFinite(n);
function privateFileOrDirectory(p,root,want){
  if(typeof p!=="string"||!isAbsolute(p))fail("Absolute private path required");
  const target=resolve(p);
  const rel=relative(root,target);
  if(!rel||rel===".."||rel.startsWith(".."+sep)||isAbsolute(rel))
    fail("Path must remain inside elaris-private");
  let curr=root;
  for(const piece of rel.split(sep)){
    curr=join(curr,piece);
    if(!existsSync(curr))fail("Expected private path does not exist");
    if(lstatSync(curr).isSymbolicLink())fail("Sensitive symlink path prohibited");
  }
  const real=realpathSync(target);
  if(real!==target)fail("Private path canonicalization mismatch");
  if(want==="file"&&!lstatSync(real).isFile())fail("Expected private file");
  if(want==="dir"&&!lstatSync(real).isDirectory())fail("Expected private directory");
  return real;
}
function pointer(source,ref){
  if(typeof ref!=="string"||!ref.startsWith("/")||ref.length>400)
    fail("Invalid JSON pointer");
  let cur=source;
  for(const part of ref.slice(1).split("/").map(x=>x.replace(/~1/g,"/").replace(/~0/g,"~"))){
    if(cur==null || typeof cur!=="object" ||
      !Object.prototype.hasOwnProperty.call(cur,part))fail("Unresolvable claim pointer: "+ref);
    cur=cur[part];
  }
  return cur;
}
function byPhaseJoint(source,item){
  const phase=source.phases.find(p=>p.phaseId===item.phaseId);
  if(!phase)fail("Claim points to missing phase");
  const joint=phase.components.find(c=>c.oemIndex===item.oemIndex);
  if(!joint||joint.componentId!==item.componentId||joint.componentName!==item.componentName)
    fail("Claim joint identity differs from source");
  return {phase,joint};
}
function validateLedger(source,ledger,digest){
  if(ledger?.schemaVersion!=="elaris-g1-findings-ledger/v01" ||
      ledger.sourceReportSha256!==digest || ledger.analysisId!==source.run.analysisId ||
      ledger.classification!=="SENSITIVE"||ledger.exportApproval!=="NOT_APPROVED" ||
      ledger.reviewStatus!=="REVIEW_PENDING"||ledger.noDiagnostics!==true ||
      !Array.isArray(ledger.items))fail("Ledger metadata, provenance or classification mismatch");
  const ids=new Set(),counts={};
  for(const item of ledger.items){
    if(!item?.claimId||ids.has(item.claimId))fail("Claim ID missing or duplicated");
    ids.add(item.claimId);
    counts[item.kind]=(counts[item.kind]||0)+1;
    if(item.equipmentHealthAssessment!=="NOT_ASSESSED"||item.faultSeverity!=="NOT_ASSESSED" ||
      item.reviewerStatus!=="REVIEW_PENDING"||!Array.isArray(item.sourceRefs) ||
      item.sourceRefs.length===0||typeof item.followUp!=="string" ||
      !item.followUp.trim())fail("Claim lacks traceability or review-gate protections");
    for(const ref of item.sourceRefs)pointer(source,ref);
    if(item.kind==="PHASE_OBSERVATION"){
      const p=source.phases.find(x=>x.phaseId===item.phaseId);
      if(!p||item.observed.framesAssignedToPhase!==p.frameCount ||
        !eq(item.observed.observedStart,p.observedTelemetryStart)||
        !eq(item.observed.observedEnd,p.observedTelemetryEnd))
          fail("Phase finding does not match source");
    }else if(item.kind==="UNRESOLVED_SLOT"){
      const {joint}=byPhaseJoint(source,item);
      if(joint.slotStatus!=="OBSERVED_UNRESOLVED_SLOT"||
        item.observed.slotStatus!==joint.slotStatus)fail("Slot finding is no longer unresolved");
    }else if(item.kind==="COMPONENT_COMPARISON"){
      const {phase,joint}=byPhaseJoint(source,item);
      if(phase.phaseId==="IDLE_BASELINE"||item.signal!=="joint.torque_estimate" ||
          item.comparisonReference!=="SAME_SESSION_IDLE_PRIMARY")fail("Invalid comparison reference");
      const c=joint.comparisonsToIdle?.[item.signal];
      const s=joint.signals?.[item.signal];
      if(!c||!s?.summary ||
        !numericEq(item.observed.signedAbsP95Delta,c.absP95Delta) ||
        !numericEq(item.observed.phaseAbsP95,s.summary.absP95))
          fail("Comparison value differs from source");
      const resolved=joint.slotStatus==="OBSERVED_USABLE" &&
        s.semanticsStatus==="NORMALIZED_ESTIMATE";
      if(item.interpretationGate!==(resolved?"DESCRIPTIVE_ONLY":"UNRESOLVED"))
        fail("Unresolved comparison incorrectly presented as interpretable");
    }else if(item.kind==="EVIDENCE_QUALITY"){
      const sourceRows=source.quality.findings.filter(q=>q.code===item.code);
      if(item.observed.findingRecords!==sourceRows.length ||
        sourceRows.length===0 || item.interpretationGate!=="QUALITY_NOT_HARDWARE")
        fail("Grouped quality findings mismatch");
    }else fail("Unknown finding category");
  }
  const total=Object.values(counts).reduce((a,b)=>a+b,0);
  if(total!==ledger.items.length||counts.PHASE_OBSERVATION!==8 ||
    !counts.UNRESOLVED_SLOT ||!counts.EVIDENCE_QUALITY)
    fail("Missing required review classes");
  return {counts,claims:total};
}
function validateSubsystems(source,actual){
  const recomputed=analyzeG1Subsystems(source);
  if(actual?.schemaVersion!==recomputed.schemaVersion ||
    actual.classification!=="SENSITIVE"||actual.exportApproval!=="NOT_APPROVED" ||
    actual.humanReview!=="PENDING"||actual.noDiagnostics!==true||
    !Array.isArray(actual.rows)||actual.rows.length!==21)fail("Invalid subsystem metadata");
  const byKey=new Map();
  for(const row of actual.rows){
    const key=row.phaseId+"|"+row.groupId;
    if(byKey.has(key))fail("Duplicate subsystem row");
    byKey.set(key,row);
  }
  for(const expected of recomputed.rows){
    const row=byKey.get(expected.phaseId+"|"+expected.groupId);
    if(!row ||row.expectedSlots!==expected.expectedSlots ||
      row.comparableSlots!==expected.comparableSlots ||
      row.excludedSlots!==expected.excludedSlots ||
      row.status!==expected.status ||
      !eq(row.medianSignedDelta,expected.medianSignedDelta) ||
      !eq(row.largestPositive?.oemIndex??null,expected.largestPositive?.oemIndex??null) ||
      !eq(row.largestNegative?.oemIndex??null,expected.largestNegative?.oemIndex??null) ||
      JSON.stringify(row.excluded)!==JSON.stringify(expected.excluded))
      fail("Subsystem evidence disagrees with verified source");
  }
  return {rows:recomputed.rows.length,groups:3,operationalPhases:7};
}
export function auditPrivateReport({source,sourceDigest,ledger,subsystems,manifest,outputHashes}){
  if(manifest?.sourceReportSha256!==sourceDigest||
    manifest.analysisId!==source.run.analysisId||
    manifest.exportApproval!=="NOT_APPROVED"||manifest.shareStatus!=="LOCAL_ONLY"||
    manifest.ownerAuthorizationAsserted!==false||manifest.humanReview!=="PENDING")
    fail("Private draft manifest provenance/review gate mismatch");
  const finding=validateLedger(source,ledger,sourceDigest);
  const groups=validateSubsystems(source,subsystems);
  if(manifest.structuredClaims!==finding.claims ||
    manifest.subsystemRows!==groups.rows||
    manifest.phases!==8||manifest.joints!==29||manifest.signalRows!==1624 ||
    manifest.findings!==source.quality.findings.length)
    fail("Manifest counts differ from verified source/annexes");
  if(!outputHashes||Object.keys(outputHashes).length<5)fail("Missing output digest verification");
  const reviewGroups=[
    ["EVIDENCE_QUALITY","Calidad, unidades y timestamps"],
    ["UNRESOLVED_SLOT","Slots sin resolver / variante OEM"],
    ["PHASE_OBSERVATION","Reconciliación de fases y captura"],
    ["COMPONENT_COMPARISON","Comparaciones descriptivas por articulación"]
  ];
  return {schemaVersion:"elaris-g1-private-review-audit/v01",
    classification:"SENSITIVE",exportApproval:"NOT_APPROVED",
    analysisId:source.run.analysisId,sourceReportSha256:sourceDigest,
    technicalStatus:"AUTOMATED_COHERENCE_PASS_HUMAN_REVIEW_PENDING",
    claimsChecked:finding.claims,
    subsystemRowsChecked:groups.rows,
    validatedArtifactDigests:Object.keys(outputHashes).length,
    humanReviewStatus:"PENDING",groups:reviewGroups.map(([kind,label])=>({
      kind,label,count:finding.counts[kind]??0,
      claimIds:ledger.items.filter(x=>x.kind===kind).map(x=>x.claimId)
    }))};
}
function markdownChecklist(a){
  const lines=[
    "# Elaris G1 — Control privado de revisión técnica",
    "SENSITIVE — NO APROBADO PARA COMPARTIR — revisión humana PENDIENTE.",
    "",
    "El auditor comprueba integridad, referencias, valores de los claims, agregaciones y restricciones. **No** revisa semántica OEM, seguridad ni calidad de las conclusiones científicas.",
    "",
    "Estado automatizado: "+a.technicalStatus,
    "Claims verificados estructuralmente: "+a.claimsChecked,
    "Subsistemas contrastados: "+a.subsystemRowsChecked,
    "Archivos verificados por SHA-256: "+a.validatedArtifactDigests,
    "",
    "## Orden recomendado para revisión humana",
    ""
  ];
  for(const g of a.groups){
    lines.push("### "+g.label+" ("+g.count+")");
    lines.push("Revisar mediciones, fuente, semántica, interpretación permitida y acción próxima; registrar quién revisa y cuándo. Esta plantilla NO aprueba ningún claim.");
    for(const id of g.claimIds)lines.push("- [ ] "+id+" — REVIEW_PENDING");
    lines.push("");
  }
  lines.push("## Controles finales");
  for(const x of [
    "Compatibilidad OEM, versión de robot y semántica de unidades validadas o explicitadas como desconocidas",
    "88 frames pendientes de reconciliación documental con el registro original (si aplica al dataset real)",
    "Timestamp duplicados: significado instrumental, no supuestos fallos mecánicos",
    "RightWristYaw: observable vs no resuelto sin conclusión de salud",
    "Revisión visual completa de PDF, gráficos, ejes, tablas y anexos",
    "Firmas de revisores técnicos y aprobación independiente de compartir por titular(es)"
  ])lines.push("- [ ] "+x);
  lines.push("","**Ningún ítem está aprobado automáticamente.**");
  return lines.join("\n")+"\n";
}
export async function main(argv){
  if(argv.length!==6||argv[0]!=="--input"||argv[2]!=="--draft"||argv[4]!=="--out")
    fail("Usage: --input PRIVATE_V03_JSON --draft PRIVATE_V3_DIRECTORY --out NEW_PRIVATE_AUDIT_DIR");
  const root=realpathSync(join(homedir(),"elaris-private"));
  const input=privateFileOrDirectory(argv[1],root,"file");
  const draft=privateFileOrDirectory(argv[3],root,"dir");
  const out=validatePrivateOutputTarget(argv[5],root);
  const {analysis,digest}=inspectPack(input,root);
  const manifest=JSON.parse(readFileSync(privateFileOrDirectory(join(draft,"manifest.json"),root,"file"),"utf8"));
  if(!manifest.outputs||typeof manifest.outputs!=="object" ||
      !Object.prototype.hasOwnProperty.call(manifest.outputs,"findings-ledger.json")||
      !Object.prototype.hasOwnProperty.call(manifest.outputs,"subsystem-evidence.json"))
    fail("Required V3 draft annexes missing");
  const verified={};
  for(const [file,expected] of Object.entries(manifest.outputs)){
    if(!file||basename(file)!==file||file==="manifest.json" ||
       !/^[0-9a-f]{64}$/i.test(expected))fail("Invalid output registry name/digest");
    const data=readFileSync(privateFileOrDirectory(join(draft,file),root,"file"));
    if(SHA(data)!==expected)fail("Generated artifact checksum mismatch");
    verified[file]=expected;
  }
  const ledger=JSON.parse(readFileSync(join(draft,"findings-ledger.json"),"utf8"));
  const subsystem=JSON.parse(readFileSync(join(draft,"subsystem-evidence.json"),"utf8"));
  const assessment=auditPrivateReport({source:analysis,sourceDigest:digest,
    ledger,subsystems:subsystem,manifest,outputHashes:verified});
  const md=markdownChecklist(assessment);
  const worklist=buildG1ReviewWorklist({ledger,subsystems:subsystem});
  if(worklist.claimCount!==assessment.claimsChecked)fail("Review index omits verified claims");
  const memo=g1ReviewMemo(worklist);
  const worklistCsv=g1WorklistCsv(worklist);
  const discussion=buildG1EngineeringDiscussion({source:analysis,ledger,subsystems:subsystem});
  mkdirSync(out,{mode:0o700});
  writeFileSync(join(out,"review-audit.json"),JSON.stringify(assessment,null,2)+"\n",{flag:"wx",mode:0o600});
  writeFileSync(join(out,"review-checklist.md"),md,{flag:"wx",mode:0o600});
  writeFileSync(join(out,"review-worklist.json"),JSON.stringify(worklist,null,2)+"\n",{flag:"wx",mode:0o600});
  writeFileSync(join(out,"review-worklist.csv"),worklistCsv,{flag:"wx",mode:0o600});
  writeFileSync(join(out,"review-memo.md"),memo,{flag:"wx",mode:0o600});
  writeFileSync(join(out,"engineering-discussion-draft.md"),discussion.markdown,{flag:"wx",mode:0o600});
  console.log("G1 PRIVATE REVIEW AUDIT PASS — HUMAN REVIEW PENDING; NO EXPORT");
  console.log("Claims:",assessment.claimsChecked,"Subsystem rows:",assessment.subsystemRowsChecked);
  console.log("Review worklist:",worklist.claimCount,"pending entries across",Object.keys(worklist.counts).length,"lanes");
  console.log("Engineering discussion:",discussion.groupSections,"subsystem sections; human review pending");
  console.log("Private checklist:",out);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)
  main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});

import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test, after } from "node:test";
import assert from "node:assert/strict";

const base=mkdtempSync(join(tmpdir(),"elaris-g1-exhaustive-"));
after(()=>rmSync(base,{recursive:true,force:true}));
const digest = x => createHash("sha256").update(x).digest("hex");
const SCRIPT=resolve("scripts/evidence-pack/g1-exhaustive-local-report.mjs");
const REVIEW=resolve("scripts/evidence-pack/g1-review-audit.mjs");
const channels=["joint.position","joint.velocity","joint.torque_estimate","motor.voltage",
  "motor.temperature.casing","motor.temperature.winding","motor.state_code"];
function fixture(home){
  const root=join(home,"elaris-private");mkdirSync(root,{recursive:true});
  const pack=join(root,"v03-synthetic");mkdirSync(pack);
  const components=Array.from({length:29},(_,i)=>({
    oemIndex:i,componentId:"test-g1-joint-"+i,componentName:"Fictional joint "+i,
    slotStatus:i===28?"OBSERVED_UNRESOLVED_SLOT":"OBSERVED_USABLE",
    availability:"OBSERVED",
    signals:Object.fromEntries(channels.map(name=>[name,{
      semanticsStatus:name==="joint.torque_estimate"?"NORMALIZED_ESTIMATE":"NORMALIZED_OBSERVATION",
      summary:{signal:name,unit:name==="joint.position"?"rad":null,samples:10,uniqueTimestamps:10,coverage:1,quality:"INFORMATIVE",
        min:-2,p05:-1,mean:-0.5,p50:-0.4,p95:0.8,max:1,absP95:1,first:-2,last:1,delta:3}
    }])),
    comparisonsToIdle:{"joint.torque_estimate":{baselineAbsP95:1,observedAbsP95:1,absP95Delta:0}},newStateCodesVsIdle:[]
  }));
  const names=["IDLE_BASELINE","WAIST_YAW","LEFT_SHOULDER_ROLL","LEFT_SHOULDER_PITCH",
    "LOCOMOTION_FORWARD_BACK","TURNING","MIXED_OPERATION","RECOVERY_IDLE"];
  const report={
    schemaVersion:"0.3.0",evidenceClass:"OBSERVED",sourceClassification:"SENSITIVE",
    assessment:"DESCRIPTIVE_OPERATIONAL_EVIDENCE",
    robot:{manufacturer:"Unitree",model:"G1",componentSlots:29},
    run:{analysisId:"CH-A03-FICTIONAL-REPORT",engineVersion:"component-health-evidence-engine-v03",
      inputFingerprint:"a".repeat(64),
      inputs:{
        observed:{sessionId:"SYNTHETIC",sessionState:"OPEN",workingCopyKind:"REKEYED_DERIVATIVE",
          plaintextEquivalence:"NOT_INDEPENDENTLY_VERIFIED",sourceIntegrity:{verified:true},workingCopyIntegrity:{verified:true}},
        historicalBaseline:{sessionId:"FAKE",sessionState:"FINALIZED",workingCopyKind:"REKEYED_DERIVATIVE",
          sourceIntegrity:{verified:true},workingCopyIntegrity:{verified:true}}
      }},
    reference:{phaseId:"IDLE_BASELINE",rule:"SAME_SESSION_IDLE_PRIMARY",
      historicalBaselineRole:"SECONDARY_CONTEXT_ONLY"},
    phases:names.map((name,i)=>({phaseId:name,label:"Fictional "+name,
      contextEvidenceClass:"HUMAN_CONFIRMED",declaredStart:"2026-10-06T00:00:00Z",declaredEnd:"2026-10-06T00:00:30Z",
      observedTelemetryStart:"2026-10-06T00:00:01Z",observedTelemetryEnd:"2026-10-06T00:00:29Z",
      frameCount:100+i,jointEventCount:29000,componentSlots:29,observedComponentCount:29,components:structuredClone(components)})),
    operationalFingerprints:{},quality:{maxCoverage:1,phaseQuality:names.map(phaseId=>({phaseId,
      declaredDurationMs:30000,observedDurationMs:28000,observedStartLagMs:1000,observedEndGapMs:1000,
      missingComponentSlots:0,lowCoverageSignalCount:0,duplicateSignalSampleCount:0,
      maxCoverage:1,medianInterFrameGapMs:100,maxInterFrameGapMs:100})),
      findings:[{code:"UNRESOLVED_COMPONENT_SLOT",severity:"WARNING",phaseId:"IDLE_BASELINE",
        componentId:"test-g1-joint-28",message:"Synthetic fixture only."}]},
    limitations:["Fixture, no real robot evidence."]
  };
  const payload={"field-evidence-v03.json":JSON.stringify(report),"field-evidence-v03.md":"SYNTHETIC",
    "analysis-run.json":"{}","quality-v03.json":"{}","phase-manifest.json":"{}"};
  for(const [name,data] of Object.entries(payload))writeFileSync(join(pack,name),data);
  writeFileSync(join(pack,"checksums.sha256"),Object.entries(payload).map(([name,data])=>digest(data)+"  "+name).join("\n")+"\n");
  return {root,reportPath:join(pack,"field-evidence-v03.json")};
}
test("exhaustive local report builds 8 chapters, 29 dossiers, 1624 signal rows without permission claims",()=>{
  const home=join(base,"home-one");mkdirSync(home);
  const f=fixture(home);const out=join(f.root,"private-development-report");
  const original=readFileSync(f.reportPath);
  const result=spawnSync(process.execPath,[SCRIPT,"--input",f.reportPath,"--out",out],
    {cwd:process.cwd(),env:{...process.env,HOME:home},encoding:"utf8"});
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/G1 EXHAUSTIVE LOCAL DRAFT CREATED/);
  const manifest=JSON.parse(readFileSync(join(out,"manifest.json"),"utf8"));
  assert.equal(manifest.phases,8);assert.equal(manifest.joints,29);assert.equal(manifest.signalRows,1624);
  assert.equal(manifest.findings,1);
  const subsystem=JSON.parse(readFileSync(join(out,"subsystem-evidence.json"),"utf8"));
  assert.equal(manifest.subsystemRows,21);
  assert.equal(subsystem.rows.length,21);
  assert.equal(subsystem.exportApproval,"NOT_APPROVED");
  assert.ok(subsystem.rows.every(row=>row.status==="DESCRIPTIVE_COMPARISON"));
  assert.equal(subsystem.rows.filter(row=>row.groupId==="UPPER"&&row.excludedSlots===1).length,7);
  assert.ok(subsystem.rows.every(row=>row.largestPositive===null&&row.largestNegative===null));
  assert.equal(readFileSync(join(out,"subsystem-evidence.csv"),"utf8").trimEnd().split("\n").length,22);
  const ledger=JSON.parse(readFileSync(join(out,"findings-ledger.json"),"utf8"));
  assert.equal(ledger.schemaVersion,"elaris-g1-findings-ledger/v01");
  assert.equal(ledger.exportApproval,"NOT_APPROVED");
  assert.equal(ledger.reviewStatus,"REVIEW_PENDING");
  assert.equal(ledger.items.length,manifest.structuredClaims);
  assert.equal(ledger.items.filter(x=>x.kind==="PHASE_OBSERVATION").length,8);
  assert.equal(ledger.items.filter(x=>x.kind==="UNRESOLVED_SLOT").length,8);
  assert.equal(ledger.items.filter(x=>x.kind==="COMPONENT_COMPARISON").length,7*29);
  assert.equal(ledger.items.filter(x=>x.kind==="EVIDENCE_QUALITY").length,1);
  assert.ok(ledger.items.every(x=>x.equipmentHealthAssessment==="NOT_ASSESSED"&&x.reviewerStatus==="REVIEW_PENDING"));
  assert.equal(new Set(ledger.items.map(x=>x.claimId)).size,ledger.items.length);
  assert.equal(manifest.exportApproval,"NOT_APPROVED");
  assert.equal(manifest.ownerAuthorizationAsserted,false);
  assert.equal(manifest.shareStatus,"LOCAL_ONLY");
  assert.equal(readFileSync(join(out,"component-signals.csv"),"utf8").trimEnd().split("\n").length,1625);
  const reportHtml=readFileSync(join(out,"g1-exhaustive-report.html"),"utf8");
  assert.match(reportHtml,/NOT APPROVED FOR EXPORT/);
  assert.match(reportHtml,/Lectura cuantitativa preliminar/);
  assert.match(reportHtml,/OBSERVACION NO RESUELTA/);
  assert.match(reportHtml,/A4 landscape/);
  assert.match(reportHtml,/Hallazgos trazables para revisi.n humana/);
  assert.match(reportHtml,/findings-ledger.json/);
  assert.match(reportHtml,/Slots no resueltos: 8/);
  // A valid zero-delta synthetic source must show an explicit no-data note,
  // not fabricate a chart merely to satisfy a UI assertion.
  assert.doesNotMatch(reportHtml,/<figure class="signal-plot">/);
  assert.match(reportHtml,/No hay incrementos positivos medidos aptos para graficar/);
  assert.doesNotMatch(reportHtml,/Diferencia: 14172/);
  assert.match(reportHtml,/no contiene un total independiente y verificable/);
  assert.match(reportHtml,/Comparaciones entre subsistemas/);
  assert.ok(existsSync(join(out,"quality-findings.csv")));
  assert.equal(statSync(out).mode&0o777,0o700);
  assert.equal(statSync(join(out,"g1-exhaustive-report.html")).mode&0o777,0o600);
  assert.equal(Buffer.compare(original,readFileSync(f.reportPath)),0);
  // Read-only review on generated fictional evidence, then private checklist.
  const auditOut=join(f.root,"review-audit");
  const review=spawnSync(process.execPath,[REVIEW,"--input",f.reportPath,"--draft",out,"--out",auditOut],
    {cwd:process.cwd(),env:{...process.env,HOME:home},encoding:"utf8"});
  assert.equal(review.status,0,review.stderr);
  assert.match(review.stdout,/G1 PRIVATE REVIEW AUDIT PASS/);
  const assessment=JSON.parse(readFileSync(join(auditOut,"review-audit.json"),"utf8"));
  assert.equal(assessment.technicalStatus,"AUTOMATED_COHERENCE_PASS_HUMAN_REVIEW_PENDING");
  assert.equal(assessment.claimsChecked,8+8+203+1);
  assert.equal(assessment.subsystemRowsChecked,21);
  assert.equal(assessment.humanReviewStatus,"PENDING");
  assert.equal(assessment.exportApproval,"NOT_APPROVED");
  const checklist=readFileSync(join(auditOut,"review-checklist.md"),"utf8");
  assert.match(checklist,/REVIEW_PENDING/);
  assert.match(checklist,/Ningún ítem está aprobado automáticamente/);
  assert.equal(statSync(auditOut).mode&0o777,0o700);

});
test("exhaustive local report refuses overwrites and destinations outside private root",()=>{
  const home=join(base,"home-two");mkdirSync(home);
  const f=fixture(home);const out=join(f.root,"never-overwrite");
  const args=[SCRIPT,"--input",f.reportPath,"--out",out];
  const env={...process.env,HOME:home};
  assert.equal(spawnSync(process.execPath,args,{env,encoding:"utf8"}).status,0);
  const duplicate=spawnSync(process.execPath,args,{env,encoding:"utf8"});
  assert.notEqual(duplicate.status,0);
  const external=spawnSync(process.execPath,[SCRIPT,"--input",f.reportPath,"--out",join(home,"public")],{env,encoding:"utf8"});
  assert.notEqual(external.status,0);
  assert.equal(existsSync(join(home,"public")),false);
});


function mutateSyntheticPack(reportPath, mutate) {
  const original = JSON.parse(readFileSync(reportPath,"utf8"));
  mutate(original);
  writeFileSync(reportPath,JSON.stringify(original));
  const pack=dirname(reportPath);
  const names=["field-evidence-v03.json","field-evidence-v03.md",
    "analysis-run.json","quality-v03.json","phase-manifest.json"];
  writeFileSync(join(pack,"checksums.sha256"),names.map(name=>
    digest(readFileSync(join(pack,name)))+"  "+name).join("\n")+"\n");
}
test("rejects inconsistent joint identity, invalid numerical samples and mismatched QA phases",()=>{
  const failures=[
    ["identity",report=>{report.phases[1].components[0].componentName="Different fictional joint";},
      /Inconsistent component identity/],
    ["samples",report=>{report.phases[1].components[0].signals["joint.position"].summary.samples=-3;},
      /Invalid samples/],
    ["percentiles",report=>{report.phases[1].components[0].signals["joint.position"].summary.max="invalid";},
      /Invalid summary number/],
    ["quality",report=>{report.quality.phaseQuality[1].phaseId="IDLE_BASELINE";},
      /Missing or duplicate QA phase/]
  ];
  for(const [label,change,expected] of failures){
    const home=join(base,"invalid-"+label);mkdirSync(home);
    const {root,reportPath}=fixture(home);
    mutateSyntheticPack(reportPath,change);
    const out=join(root,"should-not-exist");
    const run=spawnSync(process.execPath,[SCRIPT,"--input",reportPath,"--out",out],
      {cwd:process.cwd(),env:{...process.env,HOME:home},encoding:"utf8"});
    assert.notEqual(run.status,0,label+" should fail");
    assert.match(run.stderr,expected,label);
    assert.equal(existsSync(out),false,label+" should not create outputs");
  }
});


test("subsystem summary preserves signed changes and excludes uncertain semantics",()=>{
  const home=join(base,"signed-subsystems");mkdirSync(home);
  const {root,reportPath}=fixture(home);
  mutateSyntheticPack(reportPath,report=>{
    const turning=report.phases.find(p=>p.phaseId==="TURNING");
    const positive=turning.components[3];
    positive.signals["joint.torque_estimate"].summary.absP95=12;
    positive.comparisonsToIdle["joint.torque_estimate"]={
      baselineAbsP95:1,observedAbsP95:12,absP95Delta:11
    };
    const negative=turning.components[4];
    negative.signals["joint.torque_estimate"].summary.absP95=0.5;
    negative.comparisonsToIdle["joint.torque_estimate"]={
      baselineAbsP95:1,observedAbsP95:0.5,absP95Delta:-0.5
    };
    turning.components[5].signals["joint.torque_estimate"].semanticsStatus="OEM_SEMANTICS_UNCONFIRMED";
  });
  const out=join(root,"signed-technical-draft");
  const run=spawnSync(process.execPath,[SCRIPT,"--input",reportPath,"--out",out],
    {cwd:process.cwd(),env:{...process.env,HOME:home},encoding:"utf8"});
  assert.equal(run.status,0,run.stderr);
  const x=JSON.parse(readFileSync(join(out,"subsystem-evidence.json"),"utf8"));
  const legs=x.rows.find(r=>r.phaseId==="TURNING"&&r.groupId==="LEGS");
  assert.equal(legs.expectedSlots,12);
  assert.equal(legs.comparableSlots,11);
  assert.equal(legs.excludedSlots,1);
  const html=readFileSync(join(out,"g1-exhaustive-report.html"),"utf8");
  assert.match(html,/<figure class="signal-plot">/);
  assert.match(html,/Fictional joint 3/);
  const barForTurning=html.split('<figure class="signal-plot">').find(x=>x.includes("Variaciones del torque estimado: TURNING"));
  assert.ok(barForTurning,"TURNING phase must render eligible change");
  assert.match(barForTurning.split("</figure>")[0],/Fictional joint 3/);
  assert.doesNotMatch(barForTurning.split("</figure>")[0],/Fictional joint 5/);
  assert.equal(legs.largestPositive.oemIndex,3);
  assert.equal(legs.largestPositive.signedDelta,11);
  assert.equal(legs.largestNegative.oemIndex,4);
  assert.equal(legs.largestNegative.signedDelta,-0.5);
  assert.equal(legs.excluded[0].oemIndex,5);
  assert.equal(legs.excluded[0].reason,"SEMANTICS_UNCONFIRMED");
  assert.equal(x.noDiagnostics,true);
  assert.equal(x.humanReview,"PENDING");
  assert.equal(x.exportApproval,"NOT_APPROVED");
});


test("review gate rejects tampering even when attacker updates manifest checksum",()=>{
  const home=join(base,"review-forged-artifact");mkdirSync(home);
  const {root,reportPath}=fixture(home);
  const output=join(root,"private-draft");
  const run=spawnSync(process.execPath,[SCRIPT,"--input",reportPath,"--out",output],
    {cwd:process.cwd(),env:{...process.env,HOME:home},encoding:"utf8"});
  assert.equal(run.status,0,run.stderr);
  const ledgerPath=join(output,"findings-ledger.json");
  const ledger=JSON.parse(readFileSync(ledgerPath,"utf8"));
  const numeric=ledger.items.find(x=>x.kind==="COMPONENT_COMPARISON");
  assert.ok(numeric);
  numeric.observed.signedAbsP95Delta=12345; // forged fictional measurement
  writeFileSync(ledgerPath,JSON.stringify(ledger));
  const manifestPath=join(output,"manifest.json");
  const manifest=JSON.parse(readFileSync(manifestPath,"utf8"));
  manifest.outputs["findings-ledger.json"]=digest(readFileSync(ledgerPath));
  writeFileSync(manifestPath,JSON.stringify(manifest));
  const auditDir=join(root,"should-not-create-review");
  const check=spawnSync(process.execPath,[REVIEW,"--input",reportPath,"--draft",output,"--out",auditDir],
    {cwd:process.cwd(),env:{...process.env,HOME:home},encoding:"utf8"});
  assert.notEqual(check.status,0,"forged measurement must fail review gate");
  assert.match(check.stderr,/Comparison value differs from source/);
  assert.equal(existsSync(auditDir),false);
});

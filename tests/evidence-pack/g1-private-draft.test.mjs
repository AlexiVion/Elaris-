import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";
import assert from "node:assert/strict";
import {
  inspectPack, parseChecksumRegistry, validateV03, summarizeV03, validateAuthorization, validatePrivateOutputTarget
} from "../../scripts/evidence-pack/g1-private-draft.mjs";

const root=mkdtempSync(join(tmpdir(),"elaris-private-g1-fixture-"));
after(()=>rmSync(root,{recursive:true,force:true}));

const sha=(b)=>createHash("sha256").update(b).digest("hex");
function syntheticArtifact() {
  const components=Array.from({length:29},(_,i)=>({
    componentId:"fixture-"+i,componentName:"Fictional joint "+i,
    slotStatus:i===28?"OBSERVED_UNRESOLVED_SLOT":"OBSERVED_USABLE"
  }));
  return {
    schemaVersion:"0.3.0", evidenceClass:"OBSERVED", sourceClassification:"SENSITIVE",
    assessment:"DESCRIPTIVE_OPERATIONAL_EVIDENCE",
    robot:{manufacturer:"Unitree",model:"G1",componentSlots:29},
    run:{
      analysisId:"CH-A03-FICTIONAL-TEST",inputFingerprint:"a".repeat(64),
      inputs:{
        observed:{sourceIntegrity:{verified:true},workingCopyIntegrity:{verified:true}},
        historicalBaseline:{sourceIntegrity:{verified:true},workingCopyIntegrity:{verified:true}}
      }
    },
    reference:{rule:"SAME_SESSION_IDLE_PRIMARY",historicalBaselineRole:"SECONDARY_CONTEXT_ONLY"},
    phases:["IDLE_BASELINE","RECOVERY_IDLE"].map(id=>({
      phaseId:id,label:"Test phase "+id,contextEvidenceClass:"HUMAN_CONFIRMED",componentSlots:29,
      frameCount:21,observedComponentCount:29,
      components,observedTelemetryStart:"2026-10-06T13:00:00Z",observedTelemetryEnd:"2026-10-06T13:01:00Z"
    })),
    quality:{maxCoverage:1,phaseQuality:[],findings:[
      {code:"OEM_SEMANTICS_UNCONFIRMED",severity:"INFO"},
      {code:"UNRESOLVED_COMPONENT_SLOT",severity:"WARNING"},
    ]},
    limitations:["Synthetic test fixture — NOT physical evidence."]
  };
}
function fixtureDir(parent=root) {
  const dir=join(parent,"case-"+Math.random().toString(36).slice(2));
  mkdirSync(dir);
  const obj=syntheticArtifact();
  const payload={
    "field-evidence-v03.json":JSON.stringify(obj),
    "field-evidence-v03.md":"SYNTHETIC TEST",
    "analysis-run.json":"{}",
    "quality-v03.json":"{}",
    "phase-manifest.json":"{}",
  };
  for(const [name,data] of Object.entries(payload))writeFileSync(join(dir,name),data);
  writeFileSync(join(dir,"checksums.sha256"),Object.entries(payload).map(([name,data])=>sha(data)+"  "+name).join("\n")+"\n");
  return {dir, report:join(dir,"field-evidence-v03.json"),data:obj,digest:sha(payload["field-evidence-v03.json"])};
}

test("V0.3 metadata and descriptive summary preserve unresolved signals (never health score)",()=>{
  const s=summarizeV03(syntheticArtifact(),"b".repeat(64));
  assert.equal(s.phaseCount,2);
  assert.equal(s.phaseRows[0].unresolvedSlots,1);
  assert.equal(s.qualityFindingCount,2);
  assert.equal(s.label,"PRIVATE_INTERNAL_DRAFT_NOT_APPROVED_FOR_EXPORT");
  assert.ok(!("healthScore" in s));
});

test("verified V0.3 output pack loads only when all five artifacts match hashes",()=>{
  const f=fixtureDir();
  const result=inspectPack(f.report,root);
  assert.equal(result.digest,f.digest);
  assert.equal(result.analysis.run.analysisId,"CH-A03-FICTIONAL-TEST");
});

test("a changed report fails closed",()=>{
  const f=fixtureDir();
  writeFileSync(f.report,JSON.stringify({...f.data,run:{...f.data.run,analysisId:"MODIFIED"}}));
  assert.throws(()=>inspectPack(f.report,root),/checksum mismatch/);
});

test("missing required registry row fails closed",()=>{
  assert.throws(()=>parseChecksumRegistry("a".repeat(64)+"  field-evidence-v03.json"),/Missing required checksum/);
});

test("unsafe checksums and duplicate names are rejected",()=>{
  assert.throws(()=>parseChecksumRegistry("a".repeat(64)+"  ../etc/passwd"),/Unsafe/);
  assert.throws(()=>parseChecksumRegistry(
    "a".repeat(64)+"  field-evidence-v03.json\n"+"b".repeat(64)+"  field-evidence-v03.json"
  ),/Duplicate/);
});

test("file inside unexpected path is refused",()=>{
  const external=mkdtempSync(join(tmpdir(),"elaris-external-"));
  try {
    const f=fixtureDir();
    assert.throws(()=>inspectPack(f.report,external),/inside/);
  }finally{rmSync(external,{recursive:true,force:true})}
});

test("symlink report is rejected",()=>{
  const f=fixtureDir();
  const alias=join(f.dir,"alias");
  symlinkSync(f.report,alias);
  assert.throws(()=>inspectPack(alias,root),/Symbolic link/);
});

test("unsupported schema, robot, provenance and invalid data quality rejected",()=>{
  const a=syntheticArtifact();
  a.schemaVersion="1.0";
  assert.throws(()=>validateV03(a),/Unsupported/);
  const b=syntheticArtifact();
  b.robot.componentSlots=31;
  assert.throws(()=>validateV03(b),/29-slot/);
  const c=syntheticArtifact();
  c.run.inputs.observed.sourceIntegrity.verified=false;
  assert.throws(()=>validateV03(c),/Unverified/);
  const d=syntheticArtifact();
  d.quality.maxCoverage=1.5;
  assert.throws(()=>validateV03(d),/Invalid signal coverage/);
});

test("explicit local-only owner authorization is bound to exact input SHA256",()=>{
  const digest="1".repeat(64);
  const valid={
    schemaVersion:"elaris-field-internal-use/v1",
    status:"AUTHORIZED_FOR_LOCAL_INTERNAL_REVIEW",
    purpose:"PREPARE_DESCRIPTIVE_G1_FIELD_DRAFT",
    externalSharing:"PROHIBITED",
    authorizedBy:"Fictional test operator",
    dataOwner:"Fictional test organization",
    recordReference:"TEST-AUTH-001",
    authorizedAt:"2026-10-09T00:00:00Z",
    sourceReportSha256:digest
  };
  assert.equal(validateAuthorization(valid,digest).recordReference,"TEST-AUTH-001");
  assert.throws(()=>validateAuthorization({...valid,externalSharing:"ALLOWED"},digest),/permission/);
  assert.throws(()=>validateAuthorization({...valid,sourceReportSha256:"2".repeat(64)},digest),/permission/);
});

test("output validation permits new direct child of private root, not existing/external/symlink destinations",()=>{
  const home=join(root,"direct-child-case");
  mkdirSync(home);
  const expected=join(home,"new-internal-draft");
  assert.equal(validatePrivateOutputTarget(expected,home),expected);
  assert.throws(()=>validatePrivateOutputTarget(home,home),/NEW private directory/);
  assert.throws(()=>validatePrivateOutputTarget(join(root,"outside-private-root"),home),/NEW private directory/);
  mkdirSync(expected);
  assert.throws(()=>validatePrivateOutputTarget(expected,home),/NEW private directory/);
  const alias=join(home,"alias");
  symlinkSync(root,alias,"dir");
  assert.throws(()=>validatePrivateOutputTarget(join(alias,"new-report"),home),/Symbolic link/);
});

test("full prepare CLI creates a PRIVATE synthetic-fixture HTML with authorization; does not change original",()=>{
  const home=join(root,"isolated-test-home");
  const privateDir=join(home,"elaris-private");
  mkdirSync(home);
  mkdirSync(privateDir);
  const f=fixtureDir(privateDir);
  const original=readFileSync(f.report);
  const authPath=join(privateDir,"authorization.json");
  const auth={
    schemaVersion:"elaris-field-internal-use/v1",
    status:"AUTHORIZED_FOR_LOCAL_INTERNAL_REVIEW",
    purpose:"PREPARE_DESCRIPTIVE_G1_FIELD_DRAFT",
    externalSharing:"PROHIBITED",
    authorizedBy:"Synthetic fixture reviewer",
    dataOwner:"Synthetic fixture organization",
    recordReference:"FIXTURE-ONLY-0001",
    authorizedAt:"2026-10-09T12:00:00Z",
    sourceReportSha256:f.digest
  };
  writeFileSync(authPath,JSON.stringify(auth));
  const target=join(privateDir,"first-internal-g1-draft");
  const args=[
    resolve("scripts/evidence-pack/g1-private-draft.mjs"),"prepare",
    "--input",f.report,"--authorization",authPath,"--out",target
  ];
  const result=spawnSync(process.execPath,args,{
    cwd:process.cwd(),env:{...process.env,HOME:home},encoding:"utf8"
  });
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/PRIVATE DRAFT CREATED/);
  assert.equal(existsSync(join(target,"internal-g1-draft.html")),true);
  assert.equal(existsSync(join(target,"internal-g1-draft.pdf")),false);
  const html=readFileSync(join(target,"internal-g1-draft.html"),"utf8");
  assert.match(html,/SENSITIVE — PRIVATE INTERNAL DRAFT — NOT APPROVED FOR EXPORT/);
  assert.match(html,/Synthetic fixture reviewer/);
  assert.match(html,/G1 · Technical Field Evidence/);
  const manifest=JSON.parse(readFileSync(join(target,"internal-draft-manifest.json"),"utf8"));
  assert.equal(manifest.exportApproval,"NOT_APPROVED");
  assert.equal(manifest.sourceReportSha256,f.digest);
  assert.equal(manifest.outputSha256["internal-g1-draft.html"],sha(html));
  assert.equal(statSync(target).mode & 0o777,0o700);
  assert.equal(statSync(join(target,"internal-g1-draft.html")).mode & 0o777,0o600);
  assert.equal(Buffer.compare(original,readFileSync(f.report)),0);
  const rerun=spawnSync(process.execPath,args,{
    cwd:process.cwd(),env:{...process.env,HOME:home},encoding:"utf8"
  });
  assert.notEqual(rerun.status,0);
  assert.match(rerun.stderr,/NEW private directory/);
});

import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { inspectPack, validateAuthorization } from "./g1-private-draft.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const privateRoot = join(homedir(), "elaris-private");
const MAX_TEXT = 2000;

export function buildInternalAuthorization({ digest, dataOwner, authorizedBy, recordReference, attestedBy, authorizationBasis, now }) {
  const values = [dataOwner,authorizedBy,recordReference,attestedBy,authorizationBasis];
  if (!/^[0-9a-f]{64}$/.test(digest) || values.some(v=>typeof v!=="string" || !v.trim() || v.length>MAX_TEXT)) {
    throw new Error("All real authorization metadata fields must be supplied. No invented/empty values.");
  }
  const time = new Date(now);
  if (!Number.isFinite(time.valueOf())) throw new Error("Invalid record timestamp");
  const record = {
    schemaVersion: "elaris-field-internal-use/v1",
    status: "AUTHORIZED_FOR_LOCAL_INTERNAL_REVIEW",
    purpose: "PREPARE_DESCRIPTIVE_G1_FIELD_DRAFT",
    externalSharing: "PROHIBITED",
    dataOwner: dataOwner.trim(),
    authorizedBy: authorizedBy.trim(),
    recordReference: recordReference.trim(),
    attestedBy: attestedBy.trim(),
    authorizationBasis: authorizationBasis.trim(),
    authorizedAt: time.toISOString(),
    sourceReportSha256: digest,
    note: "Operator's declaration of prior owner authorization for local internal drafting only; not independent legal verification or permission to export."
  };
  validateAuthorization(record,digest);
  return record;
}

async function main() {
  if (process.argv.length !== 3 || !isAbsolute(process.argv[2])) {
    throw new Error("Usage: node scripts/evidence-pack/create-g1-internal-authorization.mjs /absolute/private/field-evidence-v03.json");
  }
  if (!existsSync(privateRoot) || lstatSync(privateRoot).isSymbolicLink()) {
    throw new Error("Private evidence root missing or symlink");
  }
  const root=realpathSync(privateRoot);
  const {analysis,digest}=inspectPack(resolve(process.argv[2]),root);
  const rl=createInterface({input:process.stdin,output:process.stdout});
  try {
    console.log("\nELARIS PRIVATE G1 EVIDENCE — AUTHORIZATION ATTESTATION");
    console.log("Analysis:",analysis.run.analysisId);
    console.log("This creates a local INTERNAL-ONLY record. It cannot authorize sharing or insurance use.");
    const dataOwner=await rl.question("Entidad titular/autorizante real (por ej. Humandroid): ");
    const authorizedBy=await rl.question("Persona real que autorizó el uso interno: ");
    const recordReference=await rl.question("Referencia VERDADERA del permiso (fecha + conversación/email/acta): ");
    const attestedBy=await rl.question("Tu nombre como responsable de registrar este permiso: ");
    const authorizationBasis=await rl.question("Cómo se obtuvo el permiso (verbal, correo, reunión, acuerdo): ");
    const confirm=await rl.question("¿Confirmás que ese permiso incluye preparar este PDF INTERNO, sin distribuirlo? Escribí AUTORIZO: ");
    if (confirm.trim() !== "AUTORIZO") throw new Error("Internal authorization attestation not confirmed");
    const record=buildInternalAuthorization({
      digest,dataOwner,authorizedBy,recordReference,attestedBy,authorizationBasis,now:new Date()
    });
    const name="g1-internal-authorization-"+sha256(digest+"|"+record.authorizedAt).slice(0,16)+".json";
    const target=join(root,name);
    writeFileSync(target,JSON.stringify(record,null,2)+"\n",{flag:"wx",mode:0o600});
    console.log("INTERNAL AUTHORIZATION RECORD CREATED");
    console.log("FILE:",target);
    console.log("EXTERNAL SHARING: PROHIBITED");
  }finally {rl.close();}
}

if (process.argv[1] && import.meta.url === new URL("file://"+resolve(process.argv[1])).href) {
  main().catch(e=>{console.error(e.message);process.exitCode=1;});
}

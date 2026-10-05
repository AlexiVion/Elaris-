#!/usr/bin/env node

import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set([
  "--quick",
  "--skip-install",
  "--skip-db",
  "--skip-e2e",
]);

for (const arg of args) {
  if (!allowedArgs.has(arg)) {
    console.error(`Unknown argument: ${arg}`);
    console.error(
      "Allowed: --quick --skip-install --skip-db --skip-e2e"
    );
    process.exit(2);
  }
}

const quick = args.has("--quick");
const skipInstall = args.has("--skip-install") || quick;
const skipDb = args.has("--skip-db") || quick;
const skipE2e = args.has("--skip-e2e") || quick;

const git = "git";
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const repoRoot = capture(git, ["rev-parse", "--show-toplevel"]).trim();
if (!repoRoot) {
  console.error("Unable to resolve the Elaris repository root.");
  process.exit(2);
}
process.chdir(repoRoot);

const nodeMajor = Number(process.versions.node.split(".")[0]);
if (!Number.isFinite(nodeMajor) || nodeMajor < 20) {
  console.error(
    `Elaris local verification requires Node >=20. Current: ${process.version}`
  );
  process.exit(2);
}

const startedAt = new Date();
const runId = startedAt
  .toISOString()
  .replace(/[:.]/g, "-")
  .replace("T", "_")
  .replace("Z", "Z");
const runDir = resolve(repoRoot, ".local-runs", runId);
mkdirSync(runDir, { recursive: true });

const logPath = resolve(runDir, "run.log");
const summaryPath = resolve(runDir, "summary.json");

const metadata = {
  version: 1,
  runId,
  profile: quick ? "quick" : "full",
  startedAt: startedAt.toISOString(),
  repositoryRoot: repoRoot,
  commitSha: capture(git, ["rev-parse", "HEAD"]).trim(),
  branch: capture(git, ["branch", "--show-current"]).trim() || "(detached)",
  node: process.version,
  pnpm: capture(pnpm, ["--version"]).trim(),
  platform: process.platform,
  arch: process.arch,
  databaseUrlSource: process.env.DATABASE_URL ? "environment" : "default-local",
  steps: [],
};

const env = {
  ...process.env,
  CI: "true",
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
};

const steps = [];

if (!skipInstall) {
  steps.push({
    id: "install",
    command: pnpm,
    args: ["install", "--frozen-lockfile"],
  });
}

if (!skipDb) {
  steps.push({
    id: "db-reset",
    command: pnpm,
    args: ["db:reset"],
  });
}

steps.push(
  { id: "lint", command: pnpm, args: ["lint"] },
  { id: "typecheck", command: pnpm, args: ["typecheck"] },
  { id: "test", command: pnpm, args: ["test"] }
);

if (!quick) {
  steps.push({ id: "build", command: pnpm, args: ["build"] });
}

if (!skipE2e) {
  steps.push({ id: "e2e", command: pnpm, args: ["test:e2e"] });
}

printHeader(metadata, steps);

let failed = false;

for (const step of steps) {
  const result = await runStep(step, repoRoot, env, logPath);
  metadata.steps.push(result);
  writeSummary(summaryPath, metadata, failed ? "FAILED" : "RUNNING");

  if (result.status !== "PASS") {
    failed = true;
    break;
  }
}

const endedAt = new Date();
metadata.endedAt = endedAt.toISOString();
metadata.durationMs = endedAt.getTime() - startedAt.getTime();
metadata.status = failed ? "FAILED" : "PASS";

writeSummary(summaryPath, metadata, metadata.status);

console.log("");
console.log("============================================================");
console.log(`ELARIS LOCAL VERIFICATION: ${metadata.status}`);
console.log(`Commit: ${metadata.commitSha}`);
console.log(`Branch: ${metadata.branch}`);
console.log(`Evidence: ${summaryPath}`);
console.log(`Log: ${logPath}`);
console.log("============================================================");

if (failed) {
  process.exitCode = 1;
}

function capture(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `Command failed: ${command} ${commandArgs.join(" ")}\n${result.stderr ?? ""}`
    );
  }

  return result.stdout ?? "";
}

function printHeader(meta, plannedSteps) {
  console.log("============================================================");
  console.log("ELARIS LOCAL VERIFICATION");
  console.log("============================================================");
  console.log(`Profile: ${meta.profile}`);
  console.log(`Commit:  ${meta.commitSha}`);
  console.log(`Branch:  ${meta.branch}`);
  console.log(`Node:    ${meta.node}`);
  console.log(`pnpm:    ${meta.pnpm}`);
  console.log(`Steps:   ${plannedSteps.map((step) => step.id).join(" -> ")}`);
  console.log("============================================================");
}

async function runStep(step, cwd, childEnv, localLogPath) {
  const started = new Date();
  const printable = [step.command, ...step.args].join(" ");
  const heading = `\n>>> [${step.id}] ${printable}\n`;

  process.stdout.write(heading);
  appendFileSync(localLogPath, heading, "utf8");

  const exitCode = await new Promise((resolveExit) => {
    const child = spawn(step.command, step.args, {
      cwd,
      env: childEnv,
      shell: false,
      windowsHide: true,
      stdio: ["inherit", "pipe", "pipe"],
    });

    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      appendFileSync(localLogPath, chunk);
    });

    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
      appendFileSync(localLogPath, chunk);
    });

    child.on("error", (error) => {
      const line = `\nRunner error: ${error.message}\n`;
      process.stderr.write(line);
      appendFileSync(localLogPath, line, "utf8");
      resolveExit(1);
    });

    child.on("close", (code) => resolveExit(code ?? 1));
  });

  const ended = new Date();
  const result = {
    id: step.id,
    command: printable,
    status: exitCode === 0 ? "PASS" : "FAIL",
    exitCode,
    startedAt: started.toISOString(),
    endedAt: ended.toISOString(),
    durationMs: ended.getTime() - started.getTime(),
  };

  const resultLine = `<<< [${step.id}] ${result.status} (${result.durationMs} ms)\n`;
  process.stdout.write(resultLine);
  appendFileSync(localLogPath, resultLine, "utf8");

  return result;
}

function writeSummary(path, meta, status) {
  writeFileSync(
    path,
    JSON.stringify(
      {
        ...meta,
        status,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
}

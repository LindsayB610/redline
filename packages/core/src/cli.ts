#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { auditPageFromHtml } from "./auditPage.js";
import { summarizeCanonicalReadiness } from "./canonical.js";
import { prepareEditBriefFromJson } from "./editBrief.js";
import { loadClientPacket } from "./loadClientPacket.js";
import { generateReportBundle, type ReportBundleInput } from "./report.js";
import { createPrivateWorkspaceTemplate } from "./workspaceTemplate.js";

export type CliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

function usage(): string {
  return [
    "Usage:",
    "  redline validate-packet --client <client-dir>",
    "  redline source-readiness --client <client-dir>",
    "  redline audit-page --html <page.html> --judge <judge.json> --id <target-id> --url <url> [--out <report.md>]",
    "  redline generate-report --input <report-input.json> --out <report-dir>",
    "  redline create-template --out <client-dir> [--client-id <id>] [--name <name>]",
    "  redline prepare-edit-brief --report <agent-edit-plan.json> [--out <edit-brief.md>]",
    "",
  ].join("\n");
}

function valueAfterFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

function missingFlag(flag: string): CliResult {
  return {
    exitCode: 1,
    stdout: "",
    stderr: `Missing required ${flag} value.\n\n${usage()}`,
  };
}

async function runValidatePacket(args: string[]): Promise<CliResult> {
  const clientDir = valueAfterFlag(args, "--client");
  if (!clientDir) {
    return missingFlag("--client");
  }

  const packet = await loadClientPacket(clientDir);
  if (!packet.validation.valid) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: packet.validation.issues
        .map((issue) => `${issue.code}: ${issue.message}`)
        .join("\n")
        .concat("\n"),
    };
  }

  return {
    exitCode: 0,
    stdout: `Packet ${packet.client.clientId} is valid.\n`,
    stderr: "",
  };
}

async function runSourceReadiness(args: string[]): Promise<CliResult> {
  const clientDir = valueAfterFlag(args, "--client");
  if (!clientDir) {
    return missingFlag("--client");
  }

  const packet = await loadClientPacket(clientDir);
  const readiness = summarizeCanonicalReadiness(
    packet.manifest,
    packet.client.requiredCanonicalModules,
  );
  const rows = Object.entries(readiness.byModule)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([moduleId, state]) => `| ${moduleId} | ${state} |`);

  return {
    exitCode: packet.validation.valid ? 0 : 1,
    stdout: ["| Module | Readiness |", "| --- | --- |", ...rows, ""].join("\n"),
    stderr: packet.validation.valid
      ? ""
      : packet.validation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n").concat("\n"),
  };
}

async function runAuditPage(args: string[]): Promise<CliResult> {
  const htmlPath = valueAfterFlag(args, "--html");
  const judgePath = valueAfterFlag(args, "--judge");
  const id = valueAfterFlag(args, "--id");
  const url = valueAfterFlag(args, "--url");
  const outPath = valueAfterFlag(args, "--out");

  if (!htmlPath) return missingFlag("--html");
  if (!judgePath) return missingFlag("--judge");
  if (!id) return missingFlag("--id");
  if (!url) return missingFlag("--url");

  const report = auditPageFromHtml({
    id,
    url,
    html: await readFile(htmlPath, "utf8"),
    judgeJson: await readFile(judgePath, "utf8"),
  }).report.markdown;

  if (outPath) {
    await writeFile(outPath, `${report}\n`, "utf8");
    return {
      exitCode: 0,
      stdout: `Wrote page audit report to ${outPath}\n`,
      stderr: "",
    };
  }

  return {
    exitCode: 0,
    stdout: report,
    stderr: "",
  };
}

async function runGenerateReport(args: string[]): Promise<CliResult> {
  const inputPath = valueAfterFlag(args, "--input");
  const outDir = valueAfterFlag(args, "--out");
  if (!inputPath) return missingFlag("--input");
  if (!outDir) return missingFlag("--out");

  const bundle = generateReportBundle(
    JSON.parse(await readFile(inputPath, "utf8")) as ReportBundleInput,
  );
  await mkdir(outDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(outDir, "executive-summary.md"), bundle.executiveSummary, "utf8"),
    writeFile(path.join(outDir, "findings.csv"), bundle.findingsCsv, "utf8"),
    writeFile(path.join(outDir, "page-redlines.md"), bundle.pageRedlines, "utf8"),
    writeFile(path.join(outDir, "agent-edit-plan.json"), `${bundle.agentEditPlanJson}\n`, "utf8"),
    writeFile(path.join(outDir, "source-readiness.md"), bundle.sourceReadiness, "utf8"),
    writeFile(path.join(outDir, "open-questions.md"), bundle.openQuestions, "utf8"),
    writeFile(path.join(outDir, "proof-gate-summary.md"), bundle.proofGateSummary, "utf8"),
  ]);

  return {
    exitCode: 0,
    stdout: `Wrote report bundle to ${outDir}\n`,
    stderr: "",
  };
}

async function runCreateTemplate(args: string[]): Promise<CliResult> {
  const outDir = valueAfterFlag(args, "--out");
  if (!outDir) {
    return missingFlag("--out");
  }

  await createPrivateWorkspaceTemplate({
    outDir,
    clientId: valueAfterFlag(args, "--client-id"),
    name: valueAfterFlag(args, "--name"),
  });

  return {
    exitCode: 0,
    stdout: `Created Redline packet template at ${outDir}\n`,
    stderr: "",
  };
}

async function runPrepareEditBrief(args: string[]): Promise<CliResult> {
  const reportPath = valueAfterFlag(args, "--report");
  const outPath = valueAfterFlag(args, "--out");

  if (!reportPath) {
    return missingFlag("--report");
  }

  const artifact = prepareEditBriefFromJson(await readFile(reportPath, "utf8"));

  if (outPath) {
    await writeFile(outPath, `${artifact.markdown}\n`, "utf8");
    return {
      exitCode: 0,
      stdout: `Wrote edit brief to ${outPath}\n`,
      stderr: "",
    };
  }

  return {
    exitCode: 0,
    stdout: artifact.markdown,
    stderr: "",
  };
}

export async function runCli(args: string[]): Promise<CliResult> {
  const [command] = args;

  try {
    if (!command || command === "--help" || command === "help") {
      return {
        exitCode: 0,
        stdout: usage(),
        stderr: "",
      };
    }

    if (command === "validate-packet") return runValidatePacket(args);
    if (command === "source-readiness") return runSourceReadiness(args);
    if (command === "audit-page") return runAuditPage(args);
    if (command === "generate-report") return runGenerateReport(args);
    if (command === "create-template") return runCreateTemplate(args);
    if (command === "prepare-edit-brief") return runPrepareEditBrief(args);

    return {
      exitCode: 1,
      stdout: "",
      stderr: `Unknown command: ${command}\n\n${usage()}`,
    };
  } catch (error) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: error instanceof Error ? `${error.message}\n` : "Unknown error.\n",
    };
  }
}

const isDirectRun = process.argv[1] ? import.meta.url === `file://${process.argv[1]}` : false;

if (isDirectRun) {
  const result = await runCli(process.argv.slice(2));

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  process.exitCode = result.exitCode;
}

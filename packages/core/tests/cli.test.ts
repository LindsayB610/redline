import { existsSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runCli } from "../src/cli.js";

async function createStandalonePacket(overrides?: {
  missingProvenance?: boolean;
}): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "redline-cli-"));
  const clientDir = path.join(root, "clients", "fixture");
  await mkdir(path.join(clientDir, "canonical"), { recursive: true });
  await writeFile(
    path.join(clientDir, "client.yaml"),
    [
      "clientId: fixture",
      "name: Fixture Client",
      "canonicalModules:",
      "  - positioning",
      "requiredCanonicalModules:",
      "  - positioning",
      "",
    ].join("\n"),
  );
  await writeFile(
    path.join(clientDir, "canonical/positioning.md"),
    "# Positioning\n\nA test-only positioning module.\n",
  );
  await writeFile(
    path.join(clientDir, "source-manifest.json"),
    `${JSON.stringify(
      {
        clientId: "fixture",
        generatedAt: "2026-06-25T00:00:00.000Z",
        sources: [
          {
            id: "source-positioning",
            clientId: "fixture",
            type: "local",
            tier: "canonical",
            trustLevel: "trusted",
            title: "Positioning",
            path: "canonical/positioning.md",
          },
        ],
        canonicalRegistry: [
          {
            moduleId: "positioning",
            clientId: "fixture",
            path: "canonical/positioning.md",
            readiness: "strong",
            provenance: [overrides?.missingProvenance ? "missing-source" : "source-positioning"],
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  return clientDir;
}

describe("Redline CLI", () => {
  it("prints stable help text for standalone commands", async () => {
    await expect(runCli(["--help"])).resolves.toEqual({
      exitCode: 0,
      stderr: "",
      stdout: [
        "Usage:",
        "  redline validate-packet --client <client-dir>",
        "  redline source-readiness --client <client-dir>",
        "  redline audit-page --html <page.html> --judge <judge.json> --id <target-id> --url <url> [--out <report.md>]",
        "  redline generate-report --input <report-input.json> --out <report-dir>",
        "  redline create-template --out <client-dir> [--client-id <id>] [--name <name>]",
        "  redline prepare-edit-brief --report <agent-edit-plan.json> [--out <edit-brief.md>]",
        "",
      ].join("\n"),
    });
  });

  it("validates a standalone packet and prints source readiness", async () => {
    const clientDir = await createStandalonePacket();

    await expect(runCli(["validate-packet", "--client", clientDir])).resolves.toEqual({
      exitCode: 0,
      stdout: "Packet fixture is valid.\n",
      stderr: "",
    });

    const readiness = await runCli(["source-readiness", "--client", clientDir]);

    expect(readiness.exitCode).toBe(0);
    expect(readiness.stderr).toBe("");
    expect(readiness.stdout).toContain("| positioning | strong |");
  });

  it("returns actionable validation errors for missing provenance", async () => {
    const clientDir = await createStandalonePacket({ missingProvenance: true });

    const result = await runCli(["validate-packet", "--client", clientDir]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("missing_provenance_source");
    expect(result.stderr).toContain("missing-source");
  });

  it("audits saved page HTML with judge JSON and writes a report", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "redline-audit-page-"));
    const htmlPath = path.join(root, "page.html");
    const judgePath = path.join(root, "judge.json");
    const outPath = path.join(root, "report.md");

    await writeFile(
      htmlPath,
      "<main><h1>Fast handoffs</h1><p>Launch your next workflow faster.</p></main>",
    );
    await writeFile(
      judgePath,
      JSON.stringify({
        findings: [
          {
            id: "finding-1",
            clientId: "fixture",
            targetId: "landing",
            url: "https://example.test/",
            mode: "buyer_language",
            label: "Generic speed claim",
            priority: "medium",
            confidence: "high",
            quotedText: "Launch your next workflow faster.",
            issue: "The claim does not say whose workflow gets faster.",
            suggestedFix: "Anchor the claim to a specific buyer workflow.",
            sourceRefs: ["source-positioning"],
            proofNeeded: "Workflow timing proof.",
            editReadiness: "ready",
          },
        ],
      }),
    );

    const result = await runCli([
      "audit-page",
      "--html",
      htmlPath,
      "--judge",
      judgePath,
      "--id",
      "landing",
      "--url",
      "https://example.test/",
      "--out",
      outPath,
    ]);

    expect(result).toEqual({
      exitCode: 0,
      stdout: `Wrote page audit report to ${outPath}\n`,
      stderr: "",
    });
    expect(readFileSync(outPath, "utf8")).toContain("Generic speed claim");
  });

  it("generates a report bundle from JSON input", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "redline-report-"));
    const inputPath = path.join(root, "report-input.json");
    const outDir = path.join(root, "reports/run");
    await writeFile(
      inputPath,
      JSON.stringify({
        clientId: "fixture",
        runId: "run-1",
        generatedAt: "2026-06-25T00:00:00.000Z",
        title: "Fixture Report",
        pages: [
          {
            id: "landing",
            url: "https://example.test/",
            title: "Landing",
            metaDescription: "",
            canonicalUrl: "",
            lastModified: "",
            publishedDate: "",
            headings: ["Landing"],
            bodyText: "Launch your next workflow faster.",
            wordCount: 5,
            isEmptyShell: false,
            links: [],
          },
        ],
        findings: [
          {
            id: "finding-1",
            clientId: "fixture",
            targetId: "landing",
            url: "https://example.test/",
            mode: "buyer_language",
            label: "Generic speed claim",
            priority: "medium",
            confidence: "high",
            quotedText: "Launch your next workflow faster.",
            issue: "The claim does not say whose workflow gets faster.",
            suggestedFix: "Anchor the claim to a specific buyer workflow.",
            sourceRefs: ["source-positioning"],
            proofNeeded: "Workflow timing proof.",
            editReadiness: "ready",
          },
        ],
        sourceReadiness: [{ moduleId: "positioning", readiness: "strong" }],
      }),
    );

    const result = await runCli(["generate-report", "--input", inputPath, "--out", outDir]);

    expect(result).toEqual({
      exitCode: 0,
      stdout: `Wrote report bundle to ${outDir}\n`,
      stderr: "",
    });
    expect(readFileSync(path.join(outDir, "executive-summary.md"), "utf8")).toContain(
      "Fixture Report",
    );
    expect(readFileSync(path.join(outDir, "agent-edit-plan.json"), "utf8")).toContain(
      "finding-1",
    );
  });

  it("creates a private workspace template without private data", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "redline-template-"));
    const outPath = path.join(root, "acme-redline");

    const result = await runCli([
      "create-template",
      "--out",
      outPath,
      "--client-id",
      "acme",
      "--name",
      "Acme Co.",
    ]);

    expect(result).toEqual({
      exitCode: 0,
      stdout: `Created Redline packet template at ${outPath}\n`,
      stderr: "",
    });
    expect(existsSync(path.join(outPath, "client.yaml"))).toBe(true);
    expect(readFileSync(path.join(outPath, "client.yaml"), "utf8")).toContain("clientId: acme");
    expect(readFileSync(path.join(outPath, "source-manifest.json"), "utf8")).not.toContain("Parasail");
  });
});

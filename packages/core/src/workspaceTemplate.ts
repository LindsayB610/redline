import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type CreatePrivateWorkspaceTemplateOptions = {
  outDir: string;
  clientId?: string;
  name?: string;
};

export async function createPrivateWorkspaceTemplate({
  outDir,
  clientId = "replace-with-client-id",
  name = "Replace With Client Name",
}: CreatePrivateWorkspaceTemplateOptions): Promise<void> {
  await mkdir(path.join(outDir, "canonical"), { recursive: true });
  await mkdir(path.join(outDir, "targets/fixtures"), { recursive: true });
  await mkdir(path.join(outDir, "reports"), { recursive: true });

  await writeFile(
    path.join(outDir, "client.yaml"),
    [
      `clientId: ${clientId}`,
      `name: ${name}`,
      "description: Local private client packet. Do not commit real client strategy.",
      "canonicalModules:",
      "  - positioning",
      "requiredCanonicalModules:",
      "  - positioning",
      "",
    ].join("\n"),
  );

  await writeFile(
    path.join(outDir, "canonical/positioning.md"),
    [
      "# Positioning",
      "",
      "Replace this placeholder with a source-backed positioning summary.",
      "",
    ].join("\n"),
  );

  await writeFile(
    path.join(outDir, "source-manifest.json"),
    `${JSON.stringify(
      {
        clientId,
        generatedAt: new Date("2026-06-25T00:00:00.000Z").toISOString(),
        sources: [
          {
            id: "source-positioning-placeholder",
            clientId,
            type: "local",
            tier: "canonical",
            trustLevel: "provisional",
            title: "Positioning placeholder",
            path: "canonical/positioning.md",
          },
        ],
        canonicalRegistry: [
          {
            moduleId: "positioning",
            clientId,
            path: "canonical/positioning.md",
            readiness: "partial",
            provenance: ["source-positioning-placeholder"],
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
}

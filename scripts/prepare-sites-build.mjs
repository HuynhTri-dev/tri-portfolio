import { cp, mkdir, readdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";

const distDirectory = new URL("../dist/", import.meta.url);
const staticDirectory = new URL("../dist/static/", import.meta.url);
const serverDirectory = new URL("../dist/server/", import.meta.url);
const hostingSource = new URL("../.openai/hosting.json", import.meta.url);
const hostingOutputDirectory = new URL("../dist/.openai/", import.meta.url);

await rm(staticDirectory, { recursive: true, force: true });
await rm(serverDirectory, { recursive: true, force: true });
await rm(hostingOutputDirectory, { recursive: true, force: true });
await mkdir(staticDirectory, { recursive: true });

const entries = await readdir(distDirectory, { withFileTypes: true });
for (const entry of entries) {
  if (["static", "server", ".openai"].includes(entry.name)) continue;
  await rename(
    new URL(entry.name, distDirectory),
    new URL(entry.name, staticDirectory),
  );
}

await mkdir(serverDirectory, { recursive: true });
await mkdir(hostingOutputDirectory, { recursive: true });
await cp(hostingSource, new URL("hosting.json", hostingOutputDirectory));


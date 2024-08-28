import { join } from "path";
import { unlink } from "node:fs/promises";
import { $ } from "bun";

const projectRoot = join(__dirname, "..");
const typesPath = join(projectRoot, "src", "types");

const pBindings = join(typesPath, "bindings.ts");

const bindings = Bun.file(pBindings);
const text = await bindings.text();

const modText = `// @ts-nocheck\n${text}`;

await Bun.write(pBindings, modText);

import { join } from "path";
import { unlink } from "node:fs/promises";
import { $ } from "bun";

const projectRoot = join(__dirname, "..");
const typesPath = join(projectRoot, "src", "types");

const pBindings = join(typesPath, "bindings.ts");
const pBindingsTypes = join(typesPath, "bindings.types.ts");

///

const bindings = Bun.file(pBindings);
const text = await bindings.text();

const match = text.match(
  /\/\*\* user-defined types \*\*\/([\s\S]*?)\/\*\* tauri-specta globals \*\*\//,
);
if (match == null) throw new Error("No match found.");

const extractedText = match
  .at(1)
  ?.trim()
  // WORKAROUND
  .replace(/\n.*FileEntry.*\n/, "\n")
  .replaceAll("{ [key in string]: TermEntry }", "Record<string, TermEntry>");

if (extractedText == null) throw new Error("No extracted text found.");

await Bun.write(pBindingsTypes, extractedText);
await $`bun run ts-to-zod --all`.cwd(projectRoot);
await unlink(pBindingsTypes);

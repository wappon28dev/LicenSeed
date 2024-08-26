import { match } from "ts-pattern";
import { summaryEntry2text } from "./seed";
import {
  type VariableWithValue,
  type SeedBaseGroup,
  type SeedDef,
} from "@/types/bindings";

function processLicenseText(
  text: string,
  valList: VariableWithValue[],
): string {
  return text
    .split("\n")
    .slice(1)
    .join("\n")
    .replaceAll(/\[(.+?)\]/g, (_, key) => {
      const val = valList.find((v) => v.key === key);
      if (val == null) {
        throw new Error(`Variable not found: ${key}`);
      }
      return val.value;
    });
}

export function generateLicenseTextFromSeedDef(
  seedDef: SeedDef,
  group: SeedBaseGroup,
): string {
  const { manifest, bases } = group;

  let text = "";

  text += `次のライセンスは \`${seedDef.territory.join(", ")}\` に適用されます。\n\n`;

  text += match(seedDef)
    .with({ data: { type: "REUSE" } }, ({ data }) => {
      const base = bases.find((b) => b.id === data.base.id);
      if (base == null) {
        throw new Error(`Base not found: ${data.base.id}`);
      }

      return processLicenseText(base.body, data.variables);
    })
    .with({ data: { type: "FORK" } }, ({ data, summary }) => {
      const base = bases.find((b) => b.id === data.base.id);
      if (base == null) {
        throw new Error(`Base not found: ${data.base.id}`);
      }

      if (summary.notes == null) {
        throw new Error("FORK seed must have notes");
      }

      const noteText = summary.notes
        .map((n) => summaryEntry2text(n, "notes", manifest.terms))
        .join("\n");

      return `
## 特記事項
${noteText}

## 本文
${processLicenseText(base.body, data.variables)}
      `.trim();
    })
    .with({ data: { type: "CUSTOM" } }, ({ data }) => data.body)
    .exhaustive();

  return text;
}

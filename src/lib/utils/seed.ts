import { match, P } from "ts-pattern";
import { searchTermEntryFromKey } from "./seed-base";
import { ask } from "@/lib/services/ai";
import { getEntries } from "@/lib/utils";
import {
  type SeedBaseGroup,
  type Summary,
  type Terms,
  type SummaryEntry,
} from "@/types/bindings";
import { type SeedDefWizardWith, type SeedCheckData } from "@/types/wizard";

function summaryEntry2text(
  entry: SummaryEntry,
  entryKey: keyof Terms,
  terms: Terms,
): string {
  return match(entry)
    .with({ type: "MARKDOWN" }, ({ title, body }) => `- ${title}  \n  ${body}`)
    .with({ type: "TERM" }, ({ key }) =>
      match(searchTermEntryFromKey(key, entryKey, terms))
        .with(
          P.nonNullable,
          ({ label, description }) => `- ${label}  \n  ${description}`,
        )
        .otherwise(() => {
          throw new Error(`\`searchTermEntryFromKey\` is null!: ${key}`);
        }),
    )
    .exhaustive();
}

function summary2text(summary: Summary, terms: Terms): string {
  return getEntries(summary)
    .map(([summaryType, summaryEntries]) => {
      if (summaryEntries == null) {
        throw new Error(`\`summaryEntries\` is null!: ${summaryType}`);
      }

      let text = `## ${summaryType}\n`;
      text += summaryEntries
        .map((e) => summaryEntry2text(e, summaryType, terms))
        .join("\n");

      return text;
    })
    .join("\n\n");
}

export function askSeedAdviceWithFork(
  seedDefWizard: SeedDefWizardWith<"FORK">,
  seedBaseGroup: SeedBaseGroup,
): ReturnType<typeof ask<SeedCheckData["FORK"]>> {
  const text = (seedDefWizard.summary.notes ?? [])
    .map((note) =>
      summaryEntry2text(note, "notes", seedBaseGroup.manifest.terms),
    )
    .join("\n");

  const baseName = seedBaseGroup.bases.find(
    (base) => base.id === seedDefWizard.data?.base?.id,
  )?.name;

  if (baseName == null) {
    throw new Error("`baseName` is null!");
  }

  return ask(
    `
    あなたは優しく正確にライセンスについてアドバイスをするエージェントです.  
    ユーザーは ${baseName} に次のような特記事項を追加しました:

    \`\`\`md
    ${text}
    \`\`\`

    では, 次の形式で返答してください:
    \`\`\`jsonschema
    {
      "type": "object",
      "properties": {
        "isContradiction": {
          "type": "boolean",
          "description": "ライセンスとが矛盾している場合は true を返します."
        },
        "advice": {
          "type": "string",
          "description": "矛盾がある場合, Markdown から \`>\` で引用し, 矛盾箇所を説明します.\n矛盾がない場合は特記事項として適切な明確さを持つアドバイスを提供します.\n問題ない場合は空文字列を返します."
        }
      },
      "required": ["isContradiction", "advice"],
      "additionalProperties": false
    }
    \`\`\`
    `.trim(),
  );
}

export function askSeedAdviceWithCustom(
  seedDefWizard: SeedDefWizardWith<"CUSTOM">,
  seedBaseGroup: SeedBaseGroup,
): ReturnType<typeof ask<SeedCheckData["CUSTOM"]>> {
  const text = summary2text(
    seedDefWizard.summary,
    seedBaseGroup.manifest.terms,
  );
  const bases = seedBaseGroup.bases.map(({ id }) => id);

  return ask(
    `
    あなたは優しく正確にライセンスについてアドバイスをするエージェントです.
    ユーザーは次のようなライセンスのサマリーを作成しました:
    \`\`\`md
    ${text}
    \`\`\`

    では, 次の形式で返答してください:
    \`\`\`jsonschema
    {
      "type": "object",
      "properties": {
        "isContradiction": {
          "type": "boolean",
          "description": "ユーザーが提供したサマリーが矛盾している場合は true を返します."
        },
        "advice": {
          "type": "string",
          "description": "矛盾がある場合, Markdown から \`>\` で引用し, 矛盾箇所を説明します.\n矛盾がない場合は特記事項として適切な明確さを持つアドバイスを提供します.\n問題ない場合は空文字列を返します."
        },
        "recommendedBaseSeedIds": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": ${JSON.stringify(bases)},
              "description": "ベースシードの ID"
            },
            "description": "ユーザーが提供したサマリーと互換性のあるシードの ID のリストです.  \n  互換性がない場合は空配列を返します."
          }
        },
      },
      "required": ["isContradiction", "advice", "recommendedBaseSeedIds"],
      "additionalProperties": false
    }
    \`\`\`
    `.trim(),
  );
}

import { match } from "ts-pattern";
import { ask } from "@/lib/services/ai";
import { type SeedBase, type Summary } from "@/types/bindings";

export type SeedContradiction = {
  isContradiction: boolean;
  advice: string;
};

export function checkSeedContradictionFork(
  baseSeed: SeedBase,
  notes: Summary["notes"],
): ReturnType<typeof ask<SeedContradiction>> {
  const extractedNotes = (notes ?? []).map((note) =>
    match(note)
      .with({ type: "TERM" }, ({ key }) => `- ${key}`)
      .with(
        { type: "MARKDOWN" },
        ({ title, body }) => `- ${title}  \n  ${body}`,
      )
      .exhaustive(),
  );

  return ask(
    `
    あなたは優しく正確にライセンスについてアドバイスをするエージェントです.  
    ユーザーは ${baseSeed.name} 次のような特記事項を追加しました:

    \`\`\`md
    ${extractedNotes.join("\n")}
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

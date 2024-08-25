import { useStore } from "@nanostores/react";
import { type ReactElement } from "react";
import { match } from "ts-pattern";
import { z } from "zod";
import { SeedDefWizard } from "./_components/SeedDefWizard";
import { ErrorScreen } from "@/components/ErrorScreen";
import { $seedDefDraft, $seedDefWizard } from "@/lib/stores/seed-def";
import { useNavigate, useParams } from "@/router";

function Loaded({ idx }: { idx: number }): ReactElement {
  const navigate = useNavigate();

  return (
    <SeedDefWizard
      onSubmit={(newSeedDef) => {
        const next = [...$seedDefDraft.get()];
        next[idx] = newSeedDef;

        $seedDefWizard.set({});
        $seedDefDraft.set(next);

        navigate("/seeds/new/overview");
      }}
    />
  );
}

export default function Page(): ReactElement {
  const seedDefDraft = useStore($seedDefDraft);
  const { idx } = useParams("/seeds/new/wizard/:idx");
  const parseResult = z
    .preprocess(
      (v) => Number(v),
      z.number().int().min(0).max(seedDefDraft.length),
    )
    .safeParse(idx);

  console.log({ seedDefDraft, idx, parseResult });

  return match(parseResult)
    .with({ success: false }, () => {
      // window.location.href = "/seeds/new/overview";

      console.error(`Invalid index: ${idx}`);

      return (
        <ErrorScreen
          error={`Invalid index: ${idx}`}
          title="サマリーウィザードの読み込み"
        />
      );
    })
    .with({ success: true }, ({ data }) => {
      const seedDef = seedDefDraft.at(data);
      if (seedDef == null) {
        return (
          <ErrorScreen
            error={`Seed definition not found: ${data}`}
            title="サマリーウィザードの読み込み"
          />
        );
      }

      $seedDefWizard.set(seedDef);

      return <Loaded idx={data} />;
    })
    .exhaustive();
}

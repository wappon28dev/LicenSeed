import { useStore } from "@nanostores/react";
import { css } from "panda/css";
import { styled as p, VStack } from "panda/jsx";
import { type ReactElement } from "react";
import { Resplit } from "react-resplit";
import { match } from "ts-pattern";
import { z } from "zod";
import { SeedDefWizard } from "./_components/SeedDefWizard";
import { ErrorScreen } from "@/components/ErrorScreen";
import { FileTree } from "@/components/FileTree";
import { Splitter } from "@/components/Splitter";
import { useNavigate } from "@/hooks/useNavigate";
import { $fileEntriesKit } from "@/lib/stores/file-tree";
import { $seedDef4overviewDraft, $seedDefWizard } from "@/lib/stores/seed-def";
import { useParams } from "@/router";

function Loaded({ idx }: { idx: number }): ReactElement {
  const fileEntriesKit = useStore($fileEntriesKit);

  if (fileEntriesKit == null) {
    // eslint-disable-next-line no-console
    console.error("`selectedFile` is null; Redirecting to `/seeds/new`");
    document.location.href = "/seeds/new";
    return (
      <ErrorScreen
        error="`selectedFile` is null; Redirecting to `/seeds/new`"
        title="サマリーのオーバービューの読み込み"
      />
    );
  }

  const { basePath, fileEntries } = fileEntriesKit;
  const seedDefWizard = useStore($seedDefWizard);
  const navigate = useNavigate();

  return (
    <p.div h="100%" p="1" w="100%">
      <Resplit.Root
        className={css({
          display: "flex",
          h: "100%",
          w: "100%",
        })}
        direction="horizontal"
      >
        <Resplit.Pane
          className={css({
            h: "100%",
            w: "100%",
          })}
          initialSize="1fr"
          order={0}
        >
          <VStack h="100%" justifyContent="space-between">
            <FileTree
              basePath={basePath}
              fileEntries={fileEntries}
              patterns={seedDefWizard?.territory ?? []}
            />
          </VStack>
        </Resplit.Pane>
        <Splitter />
        <Resplit.Pane
          className={css({
            h: "100%",
            overflowY: "auto",
          })}
          initialSize="5fr"
          order={2}
        >
          <SeedDefWizard
            onSubmit={(newSeedDef) => {
              const next = [...$seedDef4overviewDraft.get()];
              next[idx] = { ...newSeedDef, isRoot: true as const };

              $seedDefWizard.set({});
              $seedDef4overviewDraft.set(next);

              navigate("/seeds/new/overview");
            }}
            variant="EDIT"
          />
        </Resplit.Pane>
      </Resplit.Root>
    </p.div>
  );
}

export default function Page(): ReactElement {
  const seedDef4overviewDraft = useStore($seedDef4overviewDraft);
  const { idx } = useParams("/seeds/new/wizard/:idx");
  const parseResult = z
    .preprocess(
      (v) => Number(v),
      z.number().int().min(0).max(seedDef4overviewDraft.length),
    )
    .safeParse(idx);

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
      const seedDef = seedDef4overviewDraft.at(data);
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

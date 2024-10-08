import { useStore } from "@nanostores/react";
import { css } from "panda/css";
import { VStack, styled as p } from "panda/jsx";
import { useEffect, type ReactElement } from "react";
import { Resplit } from "react-resplit";
import { SeedDefWizard } from "./_components/SeedDefWizard";
import { ErrorScreen } from "@/components/ErrorScreen";
import { FileTree } from "@/components/FileTree";
import { Splitter } from "@/components/Splitter";
import { useNavigate } from "@/hooks/useNavigate.ts";
import { $fileEntriesKit } from "@/lib/stores/file-tree";
import {
  $seedCheckStatusData,
  $seedDef4overviewDraft,
  $seedDefWizard,
} from "@/lib/stores/seed-def";

export default function Page(): ReactElement {
  const selectedFiles = useStore($fileEntriesKit);

  if (selectedFiles == null) {
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

  const { basePath, fileEntries } = selectedFiles;
  const seedDefWizard = useStore($seedDefWizard);
  const navigate = useNavigate();

  useEffect(() => {
    $seedDefWizard.set({});
    $seedCheckStatusData.set(undefined);
  }, []);

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
              $seedDefWizard.set({});
              $seedDef4overviewDraft.set([
                ...$seedDef4overviewDraft.get(),
                { ...newSeedDef, isRoot: true as const },
              ]);

              navigate("/seeds/new/overview");
            }}
            variant="NEW"
          />
        </Resplit.Pane>
      </Resplit.Root>
    </p.div>
  );
}

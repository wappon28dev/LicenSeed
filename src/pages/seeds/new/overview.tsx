import { Icon } from "@iconify/react/dist/iconify.js";
import { useStore } from "@nanostores/react";
import { css } from "panda/css";
import { Divider, HStack, VStack, styled as p } from "panda/jsx";
import { useMemo, useState, type ReactElement } from "react";
import { Resplit } from "react-resplit";
import useSWRImmutable from "swr/immutable";
import { match } from "ts-pattern";
import { Button } from "@/components/Button";
import { ErrorScreen } from "@/components/ErrorScreen";
import { FileTree } from "@/components/FileTree";
import { Splitter } from "@/components/Splitter";
import { SeedDefFileMetadataInput } from "@/components/seed/def/Metadata";
import { Overview } from "@/components/seed/def/Overview";
import { useNavigate } from "@/hooks/useNavigate";
import { S } from "@/lib/consts";
import { $hoveredPatterns, $fileEntriesKit } from "@/lib/stores/file-tree";
import {
  $seedDef4overviewDraft,
  $seedDefFileUserMetadata,
} from "@/lib/stores/seed-def";
import { waitMs } from "@/lib/utils";
import { fetchGroups } from "@/lib/utils/seed-base";
import { generateLicenseTextFromSeedDef } from "@/lib/utils/seed-def";
import {
  exportSeedDefFile,
  fetchChildrenSeedDefFileKit,
  getSeedDefFileNonUserMetadata,
} from "@/lib/utils/seed-def-file";
import { type SeedDef, type SeedBaseGroup } from "@/types/bindings";
import { type FileEntriesKit } from "@/types/file";
import { type SeedDef4overview } from "@/types/wizard";

function OverviewLoader({
  fileEntriesKit,
}: {
  fileEntriesKit: FileEntriesKit;
}): ReactElement {
  const swrGroups = useSWRImmutable("seedDefFile", fetch);
  const seedDef4overviewDraft = useStore($seedDef4overviewDraft);

  async function fetch(): Promise<{
    groups: SeedBaseGroup[];
    childrenSeedDef: SeedDef4overview[];
  }> {
    const childrenSeedDef = (
      await fetchChildrenSeedDefFileKit(fileEntriesKit)
    ).flatMap((s) => s.seeds);

    $seedDef4overviewDraft.set(childrenSeedDef);
    return {
      groups: await fetchGroups(),
      childrenSeedDef,
    };
  }

  return match(swrGroups)
    .with(S.Loading, () => (
      <p.div display="grid" h="100%" placeItems="center" w="100%">
        <VStack>
          <Icon height="2em" icon="svg-spinners:ring-resize" />
          ベースシードを読み込み中...
        </VStack>
      </p.div>
    ))
    .with(S.Success, ({ data }) => (
      <Overview groups={data.groups} isEditable seeds={seedDef4overviewDraft} />
    ))
    .otherwise(({ error }) => (
      <ErrorScreen error={error} title="ベースシードの読み込み" />
    ));
}

function ExportButton({ basePath }: { basePath: string }): ReactElement {
  const swrGroups = useSWRImmutable("groups", fetchGroups);
  const seedDef4overviewDraft = useStore($seedDef4overviewDraft);
  const rootedSeedDef = useMemo<SeedDef[]>(
    () => seedDef4overviewDraft.filter((s) => s.isRoot),
    [seedDef4overviewDraft],
  );

  const [exportStatus, setExportStatus] = useState<
    "READY" | "LOADING" | "DONE" | "ERROR"
  >("READY");
  const seedDefFileUserMetadata = useStore($seedDefFileUserMetadata);

  function handleClick(groups: SeedBaseGroup[]): void {
    const licenseText = rootedSeedDef
      .map((s) => {
        const group = groups.find((g) => g.manifest.group === s.group);

        if (group == null) throw new Error(`Base group not found: ${s.group}`);

        return generateLicenseTextFromSeedDef(s, group);
      })
      .join("\n\n---\n\n");

    setExportStatus("LOADING");

    void exportSeedDefFile(
      basePath,
      rootedSeedDef,
      seedDefFileUserMetadata,
      licenseText,
    ).match(
      () => {
        setExportStatus("DONE");
        void waitMs(2000).then(() => {
          setExportStatus("READY");
        });
      },
      (e) => {
        setExportStatus("ERROR");
        throw e;
      },
    );

    void waitMs(5000).then(() => {
      setExportStatus("READY");
    });
  }

  return match(swrGroups)
    .with(S.Loading, () => <p.div />)
    .with(S.Success, ({ data }) => (
      <Button
        baseColor={exportStatus === "ERROR" ? "red" : "green"}
        disabled={
          rootedSeedDef.length === 0 ||
          exportStatus === "LOADING" ||
          exportStatus === "DONE"
        }
        icon={match(exportStatus)
          .with("READY", () => "mdi:seed")
          .with("LOADING", () => "svg-spinners:ring-resize")
          .with("DONE", () => "mdi:check")
          .with("ERROR", () => "mdi:alert")
          .exhaustive()}
        onClick={() => {
          handleClick(data);
        }}
      >
        <p.p>
          {match(exportStatus)
            .with("READY", () => "付与")
            .with("LOADING", () => "付与中...")
            .with("DONE", () => "付与完了")
            .with("ERROR", () => "付与失敗")
            .exhaustive()}
        </p.p>
      </Button>
    ))
    .otherwise(({ error }) => (
      <ErrorScreen error={error} title="ベースシードの読み込み" />
    ));
}

export default function Page(): ReactElement {
  const fileEntriesKit = useStore($fileEntriesKit);
  const navigate = useNavigate();

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
  const seedDef4overviewDraft = useStore($seedDef4overviewDraft);
  const hoveredPatterns = useStore($hoveredPatterns);
  const seedDefFileMetadata = useStore($seedDefFileUserMetadata);

  const patterns =
    hoveredPatterns.length > 0
      ? hoveredPatterns
      : seedDef4overviewDraft.map((s) => s.territory).flat();

  return (
    <p.div h="100%" p="1" w="100%">
      <Resplit.Root
        className={css({
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
          <p.div h="100%" maxH="calc(100vh - 260px)" w="100%">
            <FileTree
              basePath={basePath}
              fileEntries={fileEntries}
              patterns={patterns}
            />
          </p.div>
          <Divider />
          <SeedDefFileMetadataInput
            isEditable
            metadata={{
              ...getSeedDefFileNonUserMetadata(),
              ...seedDefFileMetadata,
            }}
          />
          <Divider />
          <HStack justify="space-between" p="2">
            <Button
              baseColor="gray"
              icon="mdi:arrow-left"
              onClick={() => {
                navigate("/");
                void waitMs(100).then(() => {
                  $fileEntriesKit.set(undefined);
                });
              }}
              variant="outline"
            >
              <p.p>ホームへ</p.p>
            </Button>
            <ExportButton basePath={basePath} />
          </HStack>
        </Resplit.Pane>
        <Splitter />
        <Resplit.Pane
          className={css({ w: "100%", h: "100%" })}
          initialSize="5fr"
          order={2}
        >
          <OverviewLoader fileEntriesKit={fileEntriesKit} />
        </Resplit.Pane>
      </Resplit.Root>
    </p.div>
  );
}

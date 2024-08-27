import { Icon } from "@iconify/react/dist/iconify.js";
import { useStore } from "@nanostores/react";
import { css } from "panda/css";
import { Divider, HStack, VStack, styled as p } from "panda/jsx";
import { type ReactElement } from "react";
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
import { $seedDef4overviewDraft } from "@/lib/stores/seed-def";
import { waitMs } from "@/lib/utils";
import { fetchGroups } from "@/lib/utils/seed-base";
import {
  fetchRootAndChildrenSeedDefFileKit,
  fetchSeedDefFileKit,
} from "@/lib/utils/seed-def-file";
import { type SeedBaseGroup } from "@/types/bindings";
import { type FileEntriesKit } from "@/types/file";
import { type SeedDefFileKit4overview } from "@/types/wizard";

function OverviewLoader({
  fileEntriesKit,
}: {
  fileEntriesKit: FileEntriesKit;
}): ReactElement {
  const swrGroups = useSWRImmutable("seedDefFile", fetch);

  async function fetch(): Promise<{
    groups: SeedBaseGroup[];
    seedDefFileKit4overview: SeedDefFileKit4overview;
  }> {
    return {
      groups: await fetchGroups(),
      seedDefFileKit4overview:
        await fetchRootAndChildrenSeedDefFileKit(fileEntriesKit),
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
    .with(S.Success, ({ data: { groups, seedDefFileKit4overview } }) => (
      <Overview
        groups={groups}
        licenseBody={seedDefFileKit4overview.licenseBody}
        seeds={seedDefFileKit4overview.seeds}
      />
    ))
    .otherwise(({ error }) => (
      <ErrorScreen error={error} title="ベースシードの読み込み" />
    ));
}

function SeedDefFileMetadataInputLoader({
  basePath,
}: {
  basePath: string;
}): ReactElement {
  const swrSeedDefFileKit = useSWRImmutable(
    "seedDefFileKit",
    async () => await fetchSeedDefFileKit(basePath),
  );

  return match(swrSeedDefFileKit)
    .with(S.Loading, () => (
      <p.div display="grid" h="100%" placeItems="center" w="100%">
        <VStack>
          <Icon height="2em" icon="svg-spinners:ring-resize" />
          メタデータを読み込み中...
        </VStack>
      </p.div>
    ))
    .with(S.Success, ({ data }) => (
      <SeedDefFileMetadataInput metadata={data.metadata} />
    ))
    .otherwise(({ error }) => (
      <ErrorScreen error={error} title="メタデータの読み込み" />
    ));
}

export default function Page(): ReactElement {
  const fileEntriesKit = useStore($fileEntriesKit);
  const navigate = useNavigate();

  if (fileEntriesKit == null) {
    // eslint-disable-next-line no-console
    console.error("`fileEntriesKit` is null; Redirecting to `/seeds/view`");
    document.location.href = "/seeds/view";
    return (
      <ErrorScreen
        error="`fileEntriesKit` is null; Redirecting to `/seeds/view`"
        title="サマリーのオーバービューの読み込み"
      />
    );
  }

  const { basePath, fileEntries } = fileEntriesKit;
  const seedDef4overviewDraft = useStore($seedDef4overviewDraft);
  const hoveredPatterns = useStore($hoveredPatterns);

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
          <SeedDefFileMetadataInputLoader basePath={basePath} />
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

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
import { MDPreview } from "@/components/MDPreview";
import { Splitter } from "@/components/Splitter";
import { SeedDefPreview } from "@/components/seed/def/Preview";
import { useNavigate } from "@/hooks/useNavigate";
import { S } from "@/lib/consts";
import { $hoveredPatterns, $selectedFiles } from "@/lib/stores/file-tree";
import { $seedDefDraft } from "@/lib/stores/seed-def";
import { waitMs } from "@/lib/utils";
import { fetchGroups } from "@/lib/utils/seed-base";
import { importSeedDefFileKit } from "@/lib/utils/seed-def-file";
import { type SeedBaseGroup, type SeedDefFileKit } from "@/types/bindings";

function Overview({
  seedDefFileKit,
  groups,
}: {
  seedDefFileKit: SeedDefFileKit;
  groups: SeedBaseGroup[];
}): ReactElement {
  return (
    <Resplit.Root
      className={css({ w: "100%", h: "100%" })}
      direction="horizontal"
    >
      <Resplit.Pane
        className={css({ w: "100%", maxH: "100vh", overflowY: "auto" })}
        initialSize="3fr"
        order={0}
      >
        <VStack pr="1" px="0" w="100%">
          <p.p
            bg="white"
            fontWeight="bold"
            p="1"
            position="sticky"
            textAlign="left"
            top="0"
            w="100%"
          >
            シード一覧
          </p.p>
          {seedDefFileKit.seeds.map((s) => {
            const group = groups.find((g) => g.manifest.group === s.group);
            if (group == null) {
              return (
                <ErrorScreen
                  key={s.title}
                  error={`Base group not found: ${s.group}`}
                  title="ベースシードの読み込み"
                />
              );
            }

            return (
              <p.div
                key={s.title}
                _hover={{ bgColor: "blue.50" }}
                h="100%"
                onMouseEnter={() => {
                  $hoveredPatterns.set(s.territory);
                }}
                onMouseLeave={() => {
                  $hoveredPatterns.set([]);
                }}
                w="100%"
              >
                <SeedDefPreview
                  seedDef={s}
                  seedGroupManifest={group.manifest}
                />
              </p.div>
            );
          })}
        </VStack>
      </Resplit.Pane>
      <Splitter />
      <Resplit.Pane
        className={css({ w: "100%", h: "100%" })}
        initialSize="1fr"
        order={2}
      >
        <p.p fontWeight="bold">ライセンス文</p.p>
        <p.div>
          <MDPreview
            source={seedDefFileKit.licenseBody}
            style={{ height: "calc(100vh - 40px)", overflowY: "auto" }}
          />
        </p.div>
      </Resplit.Pane>
    </Resplit.Root>
  );
}

function OverviewLoader({ basePath }: { basePath: string }): ReactElement {
  const swrGroups = useSWRImmutable("seedDefFile", fetch);

  async function fetch(): Promise<{
    groups: SeedBaseGroup[];
    seedDefFileKit: SeedDefFileKit;
  }> {
    return {
      groups: await fetchGroups(),
      seedDefFileKit: await importSeedDefFileKit(basePath),
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
    .with(S.Success, ({ data: { groups, seedDefFileKit } }) => (
      <Overview groups={groups} seedDefFileKit={seedDefFileKit} />
    ))
    .otherwise(({ error }) => (
      <ErrorScreen error={error} title="ベースシードの読み込み" />
    ));
}

export default function Page(): ReactElement {
  const selectedFiles = useStore($selectedFiles);
  const navigate = useNavigate();

  if (selectedFiles == null) {
    // eslint-disable-next-line no-console
    console.error("`selectedFile` is null; Redirecting to `/seeds/view`");
    document.location.href = "/seeds/view";
    return (
      <ErrorScreen
        error="`selectedFile` is null; Redirecting to `/seeds/view`"
        title="サマリーのオーバービューの読み込み"
      />
    );
  }

  const { basePath, fileEntries } = selectedFiles;
  const seedDefDraft = useStore($seedDefDraft);
  const hoveredPatterns = useStore($hoveredPatterns);

  const patterns =
    hoveredPatterns.length > 0
      ? hoveredPatterns
      : seedDefDraft.map((s) => s.territory).flat();

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
          <p.div h="100%" maxH="calc(100vh - 70px)" w="100%">
            <FileTree
              basePath={basePath}
              fileEntries={fileEntries}
              patterns={patterns}
            />
          </p.div>
          <Divider />
          <HStack justify="space-between" p="2">
            <Button
              baseColor="gray"
              icon="mdi:arrow-left"
              onClick={() => {
                navigate("/");
                void waitMs(100).then(() => {
                  $selectedFiles.set(undefined);
                });
              }}
              variant="outline"
            >
              <p.p>ホームへ戻る</p.p>
            </Button>
          </HStack>
        </Resplit.Pane>
        <Splitter />
        <Resplit.Pane
          className={css({ w: "100%", h: "100%" })}
          initialSize="5fr"
          order={2}
        >
          <OverviewLoader basePath={basePath} />
        </Resplit.Pane>
      </Resplit.Root>
    </p.div>
  );
}

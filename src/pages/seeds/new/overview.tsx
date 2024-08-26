import { Icon } from "@iconify/react/dist/iconify.js";
import { useStore } from "@nanostores/react";
import { css } from "panda/css";
import { Divider, VStack, styled as p } from "panda/jsx";
import { useMemo, type ReactElement } from "react";
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
import { fetchGroups } from "@/lib/utils/seed-base";
import { generateLicenseTextFromSeedDef } from "@/lib/utils/seed-def";
import { type SeedBaseGroup } from "@/types/bindings";

function Overview({ groups }: { groups: SeedBaseGroup[] }): ReactElement {
  const seedDefDraft = useStore($seedDefDraft);
  const navigate = useNavigate();

  const licenseText = useMemo(
    () =>
      seedDefDraft
        .map((s) => {
          const group = groups.find((g) => g.manifest.group === s.group);

          if (group == null)
            throw new Error(`Base group not found: ${s.group}`);

          return generateLicenseTextFromSeedDef(s, group);
        })
        .join("\n\n---\n\n"),
    [seedDefDraft],
  );

  if (seedDefDraft.length === 0) {
    return (
      <p.div display="grid" h="100%" placeItems="center" w="100%">
        <VStack>
          <Icon height="1.5rem" icon="mdi:seed-plus" />
          <p.p>まずはシードを追加してみましょう！</p.p>
          <Button
            icon="mdi:add"
            m="2"
            onClick={() => {
              navigate("/seeds/new/wizard");
            }}
            variant="filled"
          >
            <p.p>シードを追加</p.p>
          </Button>
        </VStack>
      </p.div>
    );
  }

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
          {seedDefDraft.map((s) => {
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
          <Button
            icon="mdi:add"
            m="2"
            onClick={() => {
              navigate("/seeds/new/wizard");
            }}
            variant="filled"
          >
            <p.p>シードを追加</p.p>
          </Button>
        </VStack>
      </Resplit.Pane>
      <Splitter />
      <Resplit.Pane
        className={css({ w: "100%", h: "100%" })}
        initialSize="1fr"
        order={2}
      >
        <p.p fontWeight="bold">生成されるライセンス文</p.p>
        <p.div>
          <MDPreview
            source={licenseText}
            style={{ height: "calc(100vh - 40px)", overflowY: "auto" }}
          />
        </p.div>
      </Resplit.Pane>
    </Resplit.Root>
  );
}

function OverviewLoader(): ReactElement {
  const swrGroups = useSWRImmutable("groups", fetchGroups);

  return match(swrGroups)
    .with(S.Loading, () => (
      <p.div display="grid" h="100%" placeItems="center" w="100%">
        <VStack>
          <Icon height="2em" icon="svg-spinners:ring-resize" />
          ベースシードを読み込み中...
        </VStack>
      </p.div>
    ))
    .with(S.Success, ({ data }) => <Overview groups={data} />)
    .otherwise(({ error }) => (
      <ErrorScreen error={error} title="ベースシードの読み込み" />
    ));
}

export default function Page(): ReactElement {
  const selectedFiles = useStore($selectedFiles);

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
          <p.div p="2">
            <Button
              baseColor="green"
              disabled={seedDefDraft.length === 0}
              icon="mdi:seed"
            >
              <p.p>付与</p.p>
            </Button>
          </p.div>
        </Resplit.Pane>
        <Splitter />
        <Resplit.Pane
          className={css({ w: "100%", h: "100%" })}
          initialSize="5fr"
          order={2}
        >
          <OverviewLoader />
        </Resplit.Pane>
      </Resplit.Root>
    </p.div>
  );
}

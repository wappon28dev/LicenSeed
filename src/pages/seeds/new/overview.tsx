import { Icon } from "@iconify/react/dist/iconify.js";
import { useStore } from "@nanostores/react";
import { css } from "panda/css";
import { VStack, styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { Resplit } from "react-resplit";
import useSWRImmutable from "swr/immutable";
import { match } from "ts-pattern";
import { Button } from "@/components/Button";
import { ErrorScreen } from "@/components/ErrorScreen";
import { FileTree } from "@/components/FileTree";
import { Splitter } from "@/components/Splitter";
import { SeedDefPreview } from "@/components/seed/def/Preview";
import { S } from "@/lib/consts";
import { $selectedFiles } from "@/lib/stores/file-tree";
import { $seedDefDraft, $seedDefWizard } from "@/lib/stores/seed-def";
import { fetchGroups } from "@/lib/utils/seed-base";
import { Link } from "@/router";
import { type SeedBaseGroup } from "@/types/bindings";

function Overview({ groups }: { groups: SeedBaseGroup[] }): ReactElement {
  const seedDefDraft = useStore($seedDefDraft);

  return (
    <VStack h="100%" p="3" pl="0" w="100%">
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
          <SeedDefPreview
            key={s.title}
            seedDef={s}
            seedGroupManifest={group.manifest}
          />
        );
      })}
    </VStack>
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
  const seedDefWizard = useStore($seedDefWizard);

  return (
    <p.div h="100%" w="100%">
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
            <p.div bg="green.300" h="fit-content" p="3" w="100%">
              付与
            </p.div>
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
          <VStack h="100%" justifyContent="space-between" w="100%">
            <p.div flex="1" h="100%" w="100%">
              <OverviewLoader />
            </p.div>
            <Link to="/seeds/new/wizard">
              <Button icon="mdi:add" variant="filled">
                <p.p>シードを追加</p.p>
              </Button>
            </Link>
          </VStack>
        </Resplit.Pane>
      </Resplit.Root>
    </p.div>
  );
}

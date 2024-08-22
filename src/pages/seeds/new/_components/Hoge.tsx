import { useStore } from "@nanostores/react";
import { css } from "panda/css";
import { styled as p, VStack } from "panda/jsx";
import { type ReactElement } from "react";
import { Resplit } from "react-resplit";
import { SeedDefWizard } from "./SeedDefWizard";
import { FileTree } from "@/components/FileTree";
import { Splitter } from "@/components/Splitter";
import { SeedSummary } from "@/components/seed/Summary";
import { $seedDefWizard } from "@/lib/stores/seed-def";
import { type FileEntry } from "@/types/bindings";

function SeedDefCard(): ReactElement {
  return (
    <VStack alignItems="start" bg="gray.100" p="3" w="100%">
      <p.p>1. ～～～に対するライセンス</p.p>
      <SeedSummary
        groupManifest={{
          name: "hoge",
          description: "fuga",
          group: "piyo",
          terms: {
            conditions: {},
            limitations: {},
            permissions: {},
            notes: {},
          },
        }}
        summary={{
          conditions: [],
          limitations: [],
          permissions: [],
          notes: null,
        }}
      />
    </VStack>
  );
}

export function Hoge({
  basePath,
  fileEntries,
}: {
  basePath: string;
  fileEntries: FileEntry[];
}): ReactElement {
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
          <SeedDefWizard />
          {/* <SeedDefCard /> */}
        </Resplit.Pane>
      </Resplit.Root>
      {/* <p.div bottom="4" position="absolute" right="4">
        シードを追加
      </p.div> */}
    </p.div>
  );
}

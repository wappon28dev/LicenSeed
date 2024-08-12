import { HStack, VStack, styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { match } from "ts-pattern";
import { FileSelect } from "./_components/FileSelect";
import { api } from "@/lib/services/api";

export default function Page(): ReactElement {
  return (
    <VStack h="100%" p="2" w="100%">
      <p.p fontSize="xl" fontWeight="bold" w="100%">
        1. ライセンスを付与したいファイルを含むフォルダーを選択
      </p.p>
      <p.div flex="1" w="100%">
        <FileSelect />
      </p.div>
      <HStack justifyContent="space-between" w="100%">
        <p.button>← 前へ</p.button>
        <p.button
          onClick={() => {
            console.log("次へ");
            void (async () => {
              // const base = match(await api.getSeedBase("@prg/MIT"))
              //   .with({ status: "ok" }, ({ data }) => data)
              //   .with({ status: "error", error: { type: "NOT_FOUND" } }, () => {
              //     throw new Error("SeedBase not found");
              //   })
              //   .with({ error: { type: "READING_ERROR" } }, ({ error }) => {
              //     throw new Error(`SeedBase reading error: ${error.error}`);
              //   });
              // console.log(base);

              // match(
              //   await api.writeSeedBase({
              //     id: "Apache2",
              //     description: "Apache2",
              //     summary: {
              //       conditions: "asdf",
              //       permissions: "asdf",
              //       limitations: "asdf",
              //     },
              //     variables: [
              //       {
              //         key: "Apache2",
              //         description: "Apache2",
              //         value: "Apache2",
              //       },
              //     ],
              //     body: "Apache2",
              //   }),
              // );

              // match(
              //   await api.writeSeedDef("hoge.yml", {
              //     seeds: [],
              //     licenseHash: "",
              //     version: "2",
              //   }),
              // )
              //   .with({ status: "ok" }, ({ data }) => {
              //     console.log(data);
              //   })
              //   .otherwise(({ error }) => {
              //     console.log(error);
              //   });

              // const baseSeeds = match(await api.collectSeedBases())
              //   .with({ status: "ok" }, ({ data }) => data)
              //   .with({ status: "error", error: { type: "NOT_FOUND" } }, () => {
              //     throw new Error("SeedBase not found");
              //   })
              //   .with({ error: { type: "READING_ERROR" } }, ({ error }) => {
              //     throw new Error(`SeedBase reading error: ${error.error}`);
              //   });
              // console.log(baseSeeds);

              const seedBaseGroupManifest = match(
                await api.collectSeedBaseGroups(),
              ).with({ status: "ok" }, ({ data }) => data);
              console.log(seedBaseGroupManifest);
            })();
          }}
        >
          次へ →
        </p.button>
      </HStack>
    </VStack>
  );
}

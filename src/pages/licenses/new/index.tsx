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
              const path = match(await api.resolveResourcesPath("hoge.md"))
                .with({ status: "ok" }, ({ data }) => data)
                .otherwise(({ error }) => {
                  throw new Error("リソースパスの解決に失敗しました.", {
                    cause: error,
                  });
                });

              match(
                await api.writeSeedFile(path, {
                  version: "1.0.0",
                  seeds: [],
                  licenseHash: "hoge",
                }),
              )
                .with({ status: "ok" }, () => {})
                .otherwise(({ error }) => {
                  throw new Error("シードファイルの書き込みに失敗しました.", {
                    cause: error,
                  });
                });
            })();
          }}
        >
          次へ →
        </p.button>
      </HStack>
    </VStack>
  );
}

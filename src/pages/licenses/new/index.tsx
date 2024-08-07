import { HStack, VStack, styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { FileSelect } from "./_components/FileSelect";

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
        <p.button>次へ →</p.button>
      </HStack>
    </VStack>
  );
}

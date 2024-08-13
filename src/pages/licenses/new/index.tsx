import { HStack, VStack, styled as p } from "panda/jsx";
import { useState, type ReactElement } from "react";
import { FileSelect } from "./_components/FileSelect";
import { SelectSeedBase } from "./_components/SelectSeedBase";
import { SelectSeedDefType } from "./_components/SelectSeedDefType";

export default function Page(): ReactElement {
  const [idx, setIdx] = useState(0);

  return (
    <VStack h="100%" p="2" w="100%">
      <p.p fontSize="xl" fontWeight="bold" w="100%">
        1. ライセンスを付与したいファイルを含むフォルダーを選択
      </p.p>
      <p.hr bg="gray.500" w="100%" />
      <p.div flex="1" overflow="auto" w="100%">
        {[
          <FileSelect key={0} />,
          <SelectSeedDefType key={1} />,
          <SelectSeedBase key={2} />,
        ].at(idx)}
      </p.div>
      <HStack justifyContent="space-between" w="100%">
        <p.button
          onClick={() => {
            setIdx((prev) => prev - 1);
          }}
        >
          ← 前へ
        </p.button>
        <p.button
          onClick={() => {
            setIdx((prev) => prev + 1);
          }}
        >
          次へ →
        </p.button>
      </HStack>
    </VStack>
  );
}

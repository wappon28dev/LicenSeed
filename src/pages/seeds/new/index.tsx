import { useStore } from "@nanostores/react";
import { HStack, VStack, styled as p } from "panda/jsx";
import { useState, type ReactElement } from "react";
import { ConfirmSeedDef } from "./_components/ConfirmSeedDef";
import { FileSelect } from "./_components/FileSelect";
import { SelectSeedBase } from "./_components/SelectSeedBase";
import { SelectSeedDefType } from "./_components/SelectSeedDefType";
import { $seedDefWizard } from "@/lib/stores/seed-def";

const components = [
  {
    title: "付与するシードの種類を選択",
    components: <SelectSeedDefType />,
  },
  {
    title: "シードベースを選択",
    components: <SelectSeedBase />,
  },
  {
    title: "ライセンスを付与したいファイルを含むフォルダーを選択",
    components: <FileSelect />,
  },
  {
    title: "シードの概要を確認",
    components: <ConfirmSeedDef />,
  },
] as const;

export default function Page(): ReactElement {
  const [idx, setIdx] = useState(0);
  const seedDefWizard = useStore($seedDefWizard);

  return (
    <VStack h="100%" p="2" w="100%">
      <p.p fontSize="xl" fontWeight="bold" w="100%">
        {idx + 1}. {components.at(idx)?.title} ({seedDefWizard?.type})
      </p.p>
      <p.hr bg="gray.500" w="100%" />
      <p.div flex="1" overflow="auto" w="100%">
        {components.at(idx)?.components}
      </p.div>
      <HStack justifyContent="space-between" w="100%">
        <p.button
          disabled={idx <= 0}
          onClick={() => {
            if (idx <= 0) return;
            setIdx((prev) => prev - 1);
          }}
        >
          ← 前へ
        </p.button>
        <p.button
          disabled={idx >= components.length - 1}
          onClick={() => {
            if (idx >= components.length - 1) return;
            setIdx((prev) => prev + 1);
          }}
        >
          次へ →
        </p.button>
      </HStack>
    </VStack>
  );
}

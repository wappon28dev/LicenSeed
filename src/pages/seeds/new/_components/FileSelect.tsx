import { Icon } from "@iconify/react";
import { VStack, styled as p } from "panda/jsx";
import { type ReactElement } from "react";

export function FileSelectionReady({
  selectDir,
}: {
  selectDir: () => Promise<void>;
}): ReactElement {
  return (
    <p.div
      bg={{ base: "blue.50", _hover: "blue.100" }}
      border="2px dashed"
      borderColor="blue.500"
      cursor="pointer"
      display="grid"
      flex="1"
      h="100%"
      onClick={() => {
        void selectDir();
      }}
      p="2"
      placeItems="center"
      rounded="lg"
      w="100%"
    >
      <VStack>
        <Icon height="3em" icon="mdi:selection-lasso" />
        <p.p>フォルダーをドラッグ＆ドロップ または クリックで選択</p.p>
      </VStack>
    </p.div>
  );
}

export function FilePatternsInput({
  patterns,
  setPatterns,
}: {
  patterns: string[];
  setPatterns: (patterns: string[]) => void;
}): ReactElement {
  return (
    <VStack alignItems="start" w="100%">
      適用したい範囲を入力 (改行で複数指定)
      <p.textarea
        border="1px solid"
        fontFamily="udev"
        maxH="5lh"
        onChange={(e) => {
          setPatterns(e.target.value.split("\n"));
        }}
        p="1"
        rounded="md"
        style={{
          // @ts-expect-error: New CSS properties
          fieldSizing: "content",
        }}
        value={patterns.join("\n")}
        w="100%"
      />
    </VStack>
  );
}

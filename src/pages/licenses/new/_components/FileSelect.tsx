import { Icon } from "@iconify/react";
import { VStack, styled as p } from "panda/jsx";
import { useState, type ReactElement } from "react";
import { FileTree } from "@/components/FileTree";
import { useFileSelection } from "@/hooks/file-selection";

function FileSelectionReady({
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

export function FileSelect(): ReactElement {
  const { fileEntries, basePath, selectDir } = useFileSelection();
  const [patterns, setPatterns] = useState<string[]>([]);

  return (
    <p.div display="flex" h="100%" w="100%">
      <p.div flex="1" h="100%" w="100%">
        {basePath == null ? (
          <FileSelectionReady selectDir={selectDir} />
        ) : (
          <FileTree
            basePath={basePath}
            fileEntries={fileEntries}
            patterns={patterns}
          />
        )}
      </p.div>
      <VStack p="2">
        パターンを入力
        <p.input
          bg="blue.100"
          fontFamily="mono"
          onChange={(e) => {
            setPatterns([e.target.value]);
          }}
          p="1"
          type="text"
          value={patterns}
          w="100%"
        />
      </VStack>
    </p.div>
  );
}

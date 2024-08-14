import { styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { FileSelectionReady } from "./_components/FileSelect";
import { Hoge } from "./_components/Hoge";
import { useFileSelection } from "@/hooks/file-selection";

export default function Page(): ReactElement {
  const { basePath, fileEntries, selectDir, setFileEntries } =
    useFileSelection();

  return basePath == null ? (
    <p.div h="100%" p="5" w="100%">
      <FileSelectionReady selectDir={selectDir} />
    </p.div>
  ) : (
    <Hoge basePath={basePath} fileEntries={fileEntries} />
  );
}

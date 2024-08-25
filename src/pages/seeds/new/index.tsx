import { styled as p } from "panda/jsx";
import { useEffect, type ReactElement } from "react";
import { FileSelectionReady } from "./wizard/_components/FileSelect";
import { useFileSelection } from "@/hooks/file-selection";
import { $selectedFiles } from "@/lib/stores/file-tree";
import { useNavigate } from "@/router";

export default function Page(): ReactElement {
  const { basePath, selectDir, fileEntries } = useFileSelection(
    $selectedFiles.get(),
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (basePath != null && fileEntries != null && fileEntries.length > 0) {
      $selectedFiles.set({
        basePath,
        fileEntries,
      });
      navigate("/seeds/new/overview");
    }
  }, [basePath, fileEntries]);

  return (
    <p.div h="100%" p="5" w="100%">
      <FileSelectionReady selectDir={selectDir} />
    </p.div>
  );
}

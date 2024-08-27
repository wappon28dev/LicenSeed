import { styled as p } from "panda/jsx";
import { useEffect, type ReactElement } from "react";
import { FileSelectionReady } from "@/components/FileSelect";
import { useFileSelection } from "@/hooks/file-selection";
import { useNavigate } from "@/hooks/useNavigate.ts";
import { $selectedFiles } from "@/lib/stores/file-tree";
import { $seedDefFileUserMetadata } from "@/lib/stores/seed-def";

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
      $seedDefFileUserMetadata.set({});
      navigate("/seeds/new/overview");
    }
  }, [basePath, fileEntries]);

  return (
    <p.div h="100%" p="5" w="100%">
      <FileSelectionReady selectDir={selectDir} />
    </p.div>
  );
}

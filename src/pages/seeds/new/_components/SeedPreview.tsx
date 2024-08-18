import { useStore } from "@nanostores/react";
import { styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { match, P } from "ts-pattern";
import { ErrorScreen } from "@/components/ErrorScreen";
import { SeedSummary } from "@/components/seed/Summary";
import {
  $seedDefWizard,
  $seedBaseGroupManifestCache,
} from "@/lib/stores/seed-def";

export function SeedPreview(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);
  const groupManifest = useStore($seedBaseGroupManifestCache);

  return match({ seedDefWizard, groupManifest })
    .with(
      {
        groupManifest: P.nonNullable,
        seedDefWizard: {
          summary: P.nonNullable,
        },
      },
      ({ seedDefWizard: _s, groupManifest: _g }) => (
        <p.div h="100%" w="100%">
          <SeedSummary groupManifest={_g} summary={_s.summary} />
        </p.div>
      ),
    )
    .when(
      () =>
        seedDefWizard.data == null ||
        seedDefWizard.summary == null ||
        groupManifest == null,
      () => (
        <p.p color="gray.500" fontSize="sm">
          プレビューするものがありません
        </p.p>
      ),
    )
    .otherwise(() => (
      <ErrorScreen
        error={`Unexpected seedDef type: ${seedDefWizard.data?.type}`}
        title="シードのプレビュー"
      />
    ));
}

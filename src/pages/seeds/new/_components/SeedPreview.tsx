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
import { type SeedBaseGroupManifest } from "@/types/bindings";
import { type SeedDefWizardPartial } from "@/types/wizard";

type DisplaySeedBaseProps = {
  seedDefWizard: NonNullable<SeedDefWizardPartial>;
  groupManifest: NonNullable<SeedBaseGroupManifest>;
};

function NothingToPreview(): ReactElement {
  return (
    <p.p color="gray.500" fontSize="sm">
      プレビューするものがありません
    </p.p>
  );
}

export function SeedPreviewReuse({
  seedDefWizard,
  groupManifest,
}: DisplaySeedBaseProps): ReactElement {
  if (seedDefWizard.summary == null || seedDefWizard.data?.type !== "REUSE") {
    return (
      <ErrorScreen
        error={`Unexpected seedDef type: ${seedDefWizard.data?.type}`}
      />
    );
  }

  return (
    <p.div h="100%" w="100%">
      <SeedSummary
        groupManifest={groupManifest}
        summary={seedDefWizard.summary}
      />
    </p.div>
  );
}

export function SeedPreviewFork({
  seedDefWizard,
  groupManifest,
}: DisplaySeedBaseProps): ReactElement {
  if (seedDefWizard.summary == null || seedDefWizard.data?.type !== "FORK") {
    return (
      <ErrorScreen
        error={`Unexpected seedDef type: ${seedDefWizard.data?.type}`}
      />
    );
  }

  return (
    <p.div h="100%" w="100%">
      <SeedSummary
        groupManifest={groupManifest}
        summary={seedDefWizard.summary}
      />
    </p.div>
  );
}

export function SeedPreview(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);
  const groupManifest = useStore($seedBaseGroupManifestCache);

  return match({ seedDefWizard, groupManifest })
    .when(
      () =>
        seedDefWizard.data == null ||
        seedDefWizard.summary == null ||
        groupManifest == null,
      () => <NothingToPreview />,
    )
    .with(
      {
        groupManifest: P.nonNullable,
        seedDefWizard: {
          data: {
            type: "REUSE",
          },
        },
      },
      ({ seedDefWizard: _s, groupManifest: _g }) => (
        <SeedPreviewReuse groupManifest={_g} seedDefWizard={_s} />
      ),
    )
    .with(
      {
        groupManifest: P.nonNullable,
        seedDefWizard: {
          data: {
            type: "FORK",
          },
        },
      },
      ({ seedDefWizard: _s, groupManifest: _g }) => (
        <SeedPreviewFork groupManifest={_g} seedDefWizard={_s} />
      ),
    )
    .otherwise(() => (
      <ErrorScreen
        error={`Unexpected seedDef type: ${seedDefWizard.data?.type}`}
        title="シードのプレビュー"
      />
    ));
}

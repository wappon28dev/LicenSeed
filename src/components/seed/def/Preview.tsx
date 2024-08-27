import { Icon } from "@iconify/react/dist/iconify.js";
import { css } from "panda/css";
import { Divider, HStack, styled as p, VStack } from "panda/jsx";
import { type ReactElement } from "react";
import { match } from "ts-pattern";
import { SeedSummary } from "@/components/seed/Summary";
import { useNavigate } from "@/hooks/useNavigate";
import { $seedDefDraft } from "@/lib/stores/seed-def";
import { seedDefTypeInfo } from "@/lib/utils/seed";
import { type SeedBaseGroupManifest, type SeedDef } from "@/types/bindings";

export function SeedDefPreview({
  seedDef,
  seedGroupManifest,
  isEditable = false,
}: {
  seedDef: SeedDef;
  seedGroupManifest: SeedBaseGroupManifest;
  isEditable?: boolean;
}): ReactElement {
  const { data, group, summary, territory, title } = seedDef;
  const idx = $seedDefDraft.get().indexOf(seedDef);
  const navigate = useNavigate();

  return (
    <VStack alignItems="start" border="1px solid" p="3" rounded="md" w="100%">
      <HStack justifyContent="space-between" w="100%">
        <p.p flex="1" fontFamily="line" fontSize="xl" fontWeight="bold">
          <p.code color="gray" fontSize="md">
            {idx + 1}.{" "}
          </p.code>{" "}
          {title}
        </p.p>
        <HStack>
          <p.p>{seedDefTypeInfo[data.type].title}</p.p>
          <Icon height="2em" icon={seedDefTypeInfo[data.type].icon} />
        </HStack>
      </HStack>
      <Divider />
      <p.div>
        <p.p>
          適用範囲: <p.code>{territory.join(", ")}</p.code>
        </p.p>
      </p.div>
      <Divider />
      <SeedSummary groupManifest={seedGroupManifest} summary={summary} />
      <Divider />
      <HStack justifyContent="space-between" w="100%">
        <HStack fontSize="sm">
          <p.p>
            シードグループ: <p.code>{group}</p.code>
          </p.p>
          {match(data)
            .with({ type: "REUSE" }, ({ base }) => (
              <p.p>
                ベースシード: <p.code>{base.id}</p.code>
              </p.p>
            ))
            .with({ type: "FORK" }, ({ base }) => (
              <p.p>
                ベースシード: <p.code>{base.id}</p.code>
              </p.p>
            ))
            .with({ type: "CUSTOM" }, () => <p.div />)
            .exhaustive()}
        </HStack>
        <HStack
          className={css({
            "& button": {
              rounded: "full",
              p: "2",
              _hover: { bg: "gray.100" },
            },
          })}
          style={{
            display: isEditable ? "flex" : "none",
          }}
        >
          <p.button
            onClick={() => {
              navigate("/seeds/new/wizard/:idx", {
                params: { idx: idx.toString() },
              });
            }}
          >
            <Icon icon="mdi:edit" />
          </p.button>
          <p.button
            onClick={() => {
              $seedDefDraft.set(
                $seedDefDraft.get().filter((s) => s !== seedDef),
              );
            }}
          >
            <Icon icon="mdi:delete-forever-outline" />
          </p.button>
        </HStack>
      </HStack>
    </VStack>
  );
}

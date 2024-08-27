import { Icon } from "@iconify/react/dist/iconify.js";
import { css } from "panda/css";
import { Divider, HStack, styled as p, VStack } from "panda/jsx";
import { token } from "panda/tokens";
import { type ReactElement } from "react";
import { match } from "ts-pattern";
import { SeedSummary } from "@/components/seed/Summary";
import { useNavigate } from "@/hooks/useNavigate";
import { $hoveredPatterns } from "@/lib/stores/file-tree";
import { $seedDef4overviewDraft } from "@/lib/stores/seed-def";
import { seedDefTypeInfo } from "@/lib/utils/seed";
import { type SeedBaseGroupManifest } from "@/types/bindings";
import { type SeedDef4overview } from "@/types/wizard";

export function SeedDefPreview({
  seedDef4overview,
  seedGroupManifest,
  isEditable = false,
}: {
  seedDef4overview: SeedDef4overview;
  seedGroupManifest: SeedBaseGroupManifest;
  isEditable?: boolean;
}): ReactElement {
  const { data, group, summary, territory, title, isRoot } = seedDef4overview;
  const idx = $seedDef4overviewDraft.get().indexOf(seedDef4overview);
  const navigate = useNavigate();

  return (
    <VStack
      _hover={{
        outlineWidth: "2px",
        outlineColor: "blue.600",
        "& .territory": {
          color: "blue.600",
        },
      }}
      alignItems="start"
      onMouseEnter={() => {
        $hoveredPatterns.set(territory);
      }}
      onMouseLeave={() => {
        $hoveredPatterns.set([]);
      }}
      outline="1px solid"
      p="3"
      rounded="md"
      w="100%"
    >
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
      <p.p className="territory">
        適用範囲: <p.code>{territory.join(", ")}</p.code>
      </p.p>
      <Divider />
      <SeedSummary groupManifest={seedGroupManifest} summary={summary} />
      <Divider />
      <HStack justifyContent="space-between" w="100%">
        <HStack fontSize="sm">
          <p.p
            cursor={isRoot ? undefined : "help"}
            p="1"
            px="2"
            rounded="md"
            style={{
              background: isRoot ? token("colors.green.500") : undefined,
              color: isRoot ? "white" : "black",
              fontWeight: isRoot ? undefined : "bold",
            }}
            title={isRoot ? "" : `\`${seedDef4overview.basePath}\` から継承中`}
          >
            {isRoot ? "ルート" : "継承"}
          </p.p>
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
              $seedDef4overviewDraft.set(
                $seedDef4overviewDraft
                  .get()
                  .filter((s) => s !== seedDef4overview),
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

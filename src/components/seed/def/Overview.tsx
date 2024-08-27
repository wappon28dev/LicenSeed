import { Icon } from "@iconify/react/dist/iconify.js";
import { css } from "panda/css";
import { VStack, styled as p } from "panda/jsx";
import { type ReactElement, useMemo } from "react";
import { Resplit } from "react-resplit";
import { SeedDefPreview } from "./Preview";
import { Button } from "@/components/Button";
import { ErrorScreen } from "@/components/ErrorScreen";
import { MDPreview } from "@/components/MDPreview";
import { Splitter } from "@/components/Splitter";
import { useNavigate } from "@/hooks/useNavigate";
import { generateLicenseTextFromSeedDef } from "@/lib/utils/seed-def";
import { type SeedBaseGroup } from "@/types/bindings";
import { type SeedDef4overview } from "@/types/wizard";

export function Overview({
  seeds,
  groups,
  licenseBody,
  isEditable = false,
}: {
  seeds: SeedDef4overview[];
  groups: SeedBaseGroup[];
  licenseBody?: string;
  isEditable?: boolean;
}): ReactElement {
  const navigate = useNavigate();

  const licenseText = useMemo(() => {
    if (licenseBody != null) return licenseBody;

    return seeds
      .map((s) => {
        const group = groups.find((g) => g.manifest.group === s.group);
        if (group == null) throw new Error(`Base group not found: ${s.group}`);
        return generateLicenseTextFromSeedDef(s, group);
      })
      .join("\n\n---\n\n");
  }, [seeds, groups, licenseBody]);

  if (seeds.length === 0 && isEditable) {
    return (
      <p.div display="grid" h="100%" placeItems="center" w="100%">
        <VStack>
          <Icon height="1.5rem" icon="mdi:seed-plus" />
          <p.p>まずはシードを追加してみましょう！</p.p>
          <Button
            icon="mdi:add"
            m="2"
            onClick={() => {
              navigate("/seeds/new/wizard");
            }}
            variant="filled"
          >
            <p.p>シードを追加</p.p>
          </Button>
        </VStack>
      </p.div>
    );
  }

  const orderedSeeds = useMemo(
    () =>
      seeds.sort((a, b) => {
        if (a.isRoot && !b.isRoot) return -1;
        if (!a.isRoot && b.isRoot) return 1;
        return 0;
      }),
    [seeds],
  );

  return (
    <Resplit.Root
      className={css({ width: "100%", height: "100%" })}
      direction="horizontal"
    >
      <Resplit.Pane
        className={css({
          width: "100%",
          maxHeight: "100vh",
          overflowY: "auto",
        })}
        initialSize="3fr"
        order={0}
      >
        <VStack pb="3" width="100%">
          <p.p
            bg="white"
            fontWeight="bold"
            p="1"
            position="sticky"
            textAlign="left"
            top="0"
            w="100%"
          >
            シード一覧
          </p.p>
          <VStack px="1" width="100%">
            {orderedSeeds.map((s) => {
              const group = groups.find((g) => g.manifest.group === s.group);
              if (group == null) {
                return (
                  <ErrorScreen
                    key={s.title}
                    error={`Base group not found: ${s.group}`}
                    title="ベースシードの読み込み"
                  />
                );
              }

              return (
                <SeedDefPreview
                  key={s.title}
                  isEditable={isEditable && s.isRoot}
                  seedDef4overview={s}
                  seedGroupManifest={group.manifest}
                />
              );
            })}
          </VStack>
          {isEditable && (
            <Button
              icon="mdi:add"
              m="2"
              onClick={() => {
                navigate("/seeds/new/wizard");
              }}
              variant="filled"
            >
              <p.p>シードを追加</p.p>
            </Button>
          )}
        </VStack>
      </Resplit.Pane>
      <Splitter />
      <Resplit.Pane
        className={css({ w: "100%", h: "100%" })}
        initialSize="1fr"
        order={2}
      >
        <p.p fontWeight="bold">
          {isEditable ? "生成されるライセンス文" : "ライセンス文"}
        </p.p>
        <p.div>
          <MDPreview
            source={licenseText}
            style={{ height: "calc(100vh - 40px)", overflowY: "auto" }}
          />
        </p.div>
      </Resplit.Pane>
    </Resplit.Root>
  );
}

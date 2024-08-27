import { err, ok, ResultAsync } from "neverthrow";
import { join } from "pathe";
import { match } from "ts-pattern";
import { calcHash } from "./hash";
import { INFO } from "@/lib/config";
import { T } from "@/lib/consts";
import { api } from "@/lib/services/api";
import {
  type SeedDefFileKit,
  type SeedDef,
  type SeedDefFile,
  type SeedDefFileMetadata,
  type FileEntry,
} from "@/types/bindings";
import { zSeedDefFile, zSeedDefFileMetadata } from "@/types/bindings.schema";
import { type FileEntriesKit } from "@/types/file";
import { type OmitStrict } from "@/types/utils";
import { type SeedDefFileKit4overview } from "@/types/wizard";

export type SeedDefFileUserMetadata = OmitStrict<
  SeedDefFileMetadata,
  "version" | "sow_date"
>;

export function getSeedDefFileNonUserMetadata(): Pick<
  SeedDefFileMetadata,
  "version" | "sow_date"
> {
  return {
    version: INFO.seedVersion.toString(),
    sow_date: new Date().toISOString(),
  };
}

export function exportSeedDefFile(
  basePath: string,
  seedDefDraft: SeedDef[],
  seedDefFileUserMetadata: Partial<SeedDefFileUserMetadata>,
  licenseBody: string,
): ResultAsync<undefined, Error> {
  const hash = calcHash(licenseBody);

  const metadata = match(
    zSeedDefFileMetadata.safeParse({
      ...seedDefFileUserMetadata,
      version: INFO.seedVersion.toString(),
      sow_date: new Date().toISOString(),
    }),
  )
    .with({ success: true }, ({ data }) => data)
    .otherwise(({ error }) => {
      throw new Error("メタデータのパースに失敗しました", { cause: error });
    });

  const seedDefFile = {
    seeds: seedDefDraft,
    metadata,
    licenseHash: hash,
  } as const satisfies SeedDefFile;

  match(zSeedDefFile.safeParse(seedDefFile)).with(
    { success: false },
    ({ error }) =>
      err(new Error("シードファイルのパースに失敗しました", { cause: error })),
  );

  return ResultAsync.fromSafePromise(
    api.writeSeedDef(basePath, seedDefFile, licenseBody),
  ).andThen((r) =>
    match(r)
      .with(T.Ok, () => ok(undefined))
      .with(T.Error, ({ error }) =>
        err(
          new Error("シードファイルの書き込みに失敗しました", { cause: error }),
        ),
      )
      .exhaustive(),
  );
}

export async function fetchSeedDefFileKit(
  basePath: string,
): Promise<SeedDefFileKit> {
  return match(await api.readSeedDef(basePath))
    .with(T.Ok, ({ data }) => {
      const { licenseBody, licenseHash } = data;
      const hash = calcHash(licenseBody);

      if (hash !== licenseHash) {
        throw new Error("ライセンスのハッシュが一致しません");
      }

      return data;
    })
    .otherwise(({ error }) => {
      throw new Error("シードファイルの読み込みに失敗しました", {
        cause: error,
      });
    });
}

export async function fetchChildrenSeedDefFileKit({
  basePath,
  fileEntries,
}: FileEntriesKit): Promise<SeedDefFileKit4overview[]> {
  function traversal(entries: FileEntry[]): FileEntry[] {
    return entries.flatMap((e) => {
      if (e.name === "LICENSEED.yml") {
        return e;
      }
      if (e.children != null) {
        return traversal(e.children);
      }
      return [];
    });
  }

  const childrenBasePathList = traversal(fileEntries)
    .map(({ relativePath }) => join(basePath, relativePath, ".."))
    .filter((b) => b !== basePath);

  return (await Promise.all(childrenBasePathList.map(fetchSeedDefFileKit))).map(
    (s, idx) => {
      const rPath = childrenBasePathList[idx].replace(basePath, "");
      return {
        ...s,
        seeds: s.seeds.map((ss) => ({
          ...ss,
          territory: ss.territory.map((t) => [rPath, t].join("/").slice(1)),
          isRoot: false,
          basePath: rPath,
        })),
      };
    },
  );
}

export async function fetchRootAndChildrenSeedDefFileKit(
  fileEntriesKit: FileEntriesKit,
): Promise<SeedDefFileKit4overview> {
  const rootSeedDefFileKit = await fetchSeedDefFileKit(fileEntriesKit.basePath);
  const childrenSeedDefFileKit =
    await fetchChildrenSeedDefFileKit(fileEntriesKit);

  return {
    ...rootSeedDefFileKit,
    seeds: [
      ...rootSeedDefFileKit.seeds.map((s) => ({
        ...s,
        isRoot: true as const,
      })),
      ...childrenSeedDefFileKit.flatMap((s) => s.seeds),
    ],
  };
}

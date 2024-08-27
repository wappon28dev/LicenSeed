import { err, ok, ResultAsync } from "neverthrow";
import { match } from "ts-pattern";
import { calcHash } from "./hash";
import { INFO } from "@/lib/config";
import { T } from "@/lib/consts";
import { api } from "@/lib/services/api";
import {
  type SeedDefFileKit,
  type SeedDef,
  type SeedDefFile,
} from "@/types/bindings";
import { zSeedDefFile } from "@/types/bindings.schema";

export function exportSeedDefFile(
  basePath: string,
  seedDefDraft: SeedDef[],
  licenseBody: string,
): ResultAsync<undefined, Error> {
  const hash = calcHash(licenseBody);

  const seedDefFile = {
    seeds: seedDefDraft,
    version: INFO.seedVersion.toString(),
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

export async function importSeedDefFileKit(
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

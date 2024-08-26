import sha256 from "crypto-js/sha256";

export function calcHash(data: string): string {
  return sha256(data).toString();
}

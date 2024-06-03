import { createClient } from "@rspc/client";
import { TauriTransport } from "@rspc/tauri";
import { Procedures } from "../../bindings";

export const api = createClient<Procedures>({
  transport: new TauriTransport(),
});

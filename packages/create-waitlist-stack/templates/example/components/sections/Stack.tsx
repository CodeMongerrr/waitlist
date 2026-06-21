import type { Theme } from "@/lib/theme";
import { PaperHead } from "../PaperHead";
import { StackDiagram } from "../StackDiagram";

export function Stack({ t }: { t: Theme }) {
  return (
    <>
      <PaperHead
        t={t}
        num="§2.0"
        kicker="The stack"
        title="Five layers of the same Cloudflare account."
      />
      <StackDiagram t={t} />
    </>
  );
}

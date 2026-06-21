import type { Theme } from "@/lib/theme";
import { PaperHead } from "../PaperHead";
import { CodeSwitcher } from "../CodeSwitcher";

export function Quickstart({ t }: { t: Theme }) {
  return (
    <>
      <PaperHead
        t={t}
        num="§3.0"
        kicker="Code-level walkthrough"
        title="What the wizard writes for you."
      />
      <CodeSwitcher t={t} defaultTab="setup" />
    </>
  );
}

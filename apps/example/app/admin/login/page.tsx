import { loginAction } from "../actions";
import config from "../../../waitlist.config";
import { safeNextOr } from "../../../lib/safe-next";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  // Open-redirect guard: only accept strictly-relative paths for `next`.
  const next = safeNextOr(params.next, config.admin.path);
  const error = typeof params.error === "string" ? params.error : null;

  async function action(formData: FormData) {
    "use server";
    const result = await loginAction(formData);
    if (result?.error) {
      const url = new URL(`${config.admin.path}/login`, "http://x");
      url.searchParams.set("error", result.error);
      url.searchParams.set("next", safeNextOr(formData.get("next"), config.admin.path));
      const { redirect } = await import("next/navigation");
      redirect(url.pathname + url.search);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F4EFE3",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        color: "#171614",
      }}
    >
      <form
        action={action}
        style={{
          width: 360,
          padding: 32,
          background: "#fffdf5",
          border: "1px solid #D9D2C0",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: 0 }}>
          {config.brand.name} admin
        </h1>
        <input type="hidden" name="next" value={next} />
        <input
          name="password"
          type="password"
          placeholder="password"
          autoFocus
          required
          style={{
            padding: "10px 12px",
            border: "1px solid #D9D2C0",
            background: "#F4EFE3",
            fontFamily: "inherit",
            fontSize: 14,
          }}
        />
        {error ? (
          <p style={{ margin: 0, color: "#A91D1D", fontSize: 13 }}>{error}</p>
        ) : null}
        <button
          type="submit"
          style={{
            padding: "10px 14px",
            background: "#171614",
            color: "#F4EFE3",
            border: 0,
            fontFamily: "inherit",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          sign in
        </button>
      </form>
    </main>
  );
}

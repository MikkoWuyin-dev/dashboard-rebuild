const COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "info",
  "info-foreground",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "border-subtle",
] as const;

function Swatch({ token }: { token: string }) {
  return (
    <figure className="flex w-24 flex-col items-center gap-1">
      <div
        data-token={`--${token}`}
        className="h-14 w-14 rounded-md border border-border"
        style={{ backgroundColor: `var(--${token})` }}
      />
      <figcaption className="text-center font-mono text-[10px] leading-tight break-all text-muted-foreground">
        --{token}
      </figcaption>
    </figure>
  );
}

function TokenGrid({ heading }: { heading: string }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{heading}</h2>
      <div className="flex flex-wrap gap-3">
        {COLOR_TOKENS.map((t) => (
          <Swatch key={t} token={t} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div
          data-token="--radius"
          className="h-14 w-14 border border-border bg-secondary"
          style={{ borderRadius: "var(--radius)" }}
        />
        <span className="font-mono text-xs text-muted-foreground">
          --radius: .625rem
        </span>
      </div>
    </section>
  );
}

export default function TokensPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-bold">/_tokens — design tokens</h1>

      <TokenGrid heading="Light (:root)" />

      <div className="dark mt-12 rounded-lg bg-background p-6 text-foreground">
        <TokenGrid heading="Dark (.dark)" />
      </div>

      <section className="mt-12 space-y-3">
        <h2 className="text-lg font-semibold">Fonts</h2>
        <p className="font-sans text-base" data-font="sans">
          Geist Sans — The quick brown fox jumps over the lazy dog. 0123456789
          !?&amp;
        </p>
        <p className="font-mono text-base" data-font="mono">
          Geist Mono — The quick brown fox jumps over the lazy dog. 0123456789
          !?&amp;
        </p>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="text-lg font-semibold">Status utilities</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span
            data-util="bg-success"
            className="inline-block h-10 w-24 rounded-md bg-success"
          />
          <span
            data-util="text-success-foreground"
            className="inline-flex h-10 w-24 items-center justify-center rounded-md bg-success text-success-foreground"
          >
            Aa
          </span>
          <span
            data-util="bg-info"
            className="inline-block h-10 w-24 rounded-md bg-info"
          />
          <span
            data-util="bg-warning"
            className="inline-block h-10 w-24 rounded-md bg-warning"
          />
          <span
            data-util="border-subtle"
            className="inline-block h-10 w-24 rounded-md border-2 border-subtle bg-background"
          />
        </div>
      </section>
    </main>
  );
}

import { useConfigStore } from "../../store/configStore";

export default function Topbar() {
  const businessName = useConfigStore((s) => s.config.businessName);
  const appName = useConfigStore((s) => s.config.appName);
  const ownerName = useConfigStore((s) => s.config.ownerName);

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-10 px-6 py-4 border-b backdrop-blur" style={{ borderColor: "var(--border-color)", background: "rgba(18,21,33,.85)" }}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[.22em] text-dinamita-muted">
            {appName}
          </p>
          <h2 className="text-2xl font-black truncate">
            {businessName}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <span className="badge-chip">PWA local</span>
          <span className="badge-chip">IndexedDB</span>
          <span className="badge-chip">Operación offline</span>

          <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-2 text-sm text-dinamita-muted">
            {today}
          </div>

          <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-2">
            <p className="text-xs text-dinamita-muted">Usuario</p>
            <p className="text-sm font-semibold">{ownerName || "Admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

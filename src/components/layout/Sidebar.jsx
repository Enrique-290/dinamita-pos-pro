import { useUIStore } from "../../store/uiStore";

const items = [
  { key: "dashboard", label: "Dashboard" },
  { key: "ventas", label: "Ventas" },
  { key: "membresias", label: "Membresías" },
  { key: "inventario", label: "Inventario" },
  { key: "clientes", label: "Clientes" },
  { key: "gastos", label: "Gastos" },
  { key: "reportes", label: "Reportes" },
  { key: "caja", label: "Caja" },
  { key: "tickets", label: "Tickets" },
  { key: "respaldo", label: "Respaldo" },
  { key: "configuracion", label: "Configuración" },
  { key: "bodega", label: "Bodega" },
  { key: "acceso", label: "Acceso" },
];

export default function Sidebar() {
  const { activeModule, setActiveModule } = useUIStore();

  return (
    <aside className="w-full lg:w-[250px] min-h-screen border-r border-dinamita-line bg-gradient-to-b from-[#0d0f18] via-[#0b0d15] to-[#090b11]">
      <div className="px-6 py-8 border-b border-dinamita-line">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-dinamita-red/90 flex items-center justify-center font-black text-lg metric-glow">
            DG
          </div>
          <div>
            <p className="text-2xl font-black tracking-wide">DINÁMITA</p>
            <p className="text-sm text-dinamita-muted -mt-1">POS PRO</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="badge-chip">React</span>
          <span className="badge-chip">Tailwind</span>
          <span className="badge-chip">Zustand</span>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {items.map((item) => {
          const active = item.key === activeModule;
          return (
            <button
              key={item.key}
              onClick={() => setActiveModule(item.key)}
              className={[
                "w-full text-left rounded-2xl px-4 py-3 transition border font-medium",
                active
                  ? "bg-dinamita-red text-white border-dinamita-red shadow-[0_10px_30px_rgba(207,17,36,.18)]"
                  : "bg-transparent text-dinamita-text border-transparent hover:bg-dinamita-panel2 hover:border-dinamita-line",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 px-4 py-4">
          <p className="text-sm font-semibold">Admin</p>
          <p className="text-xs text-dinamita-muted mt-1">Operación local · Respaldo disponible</p>
        </div>
      </div>
    </aside>
  );
}

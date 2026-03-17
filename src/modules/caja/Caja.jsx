import { money } from "../../lib/format";
import StatCard from "../../components/ui/StatCard";
import { useCajaStore } from "../../store/cajaStore";
import { useAppDataStore } from "../../store/appDataStore";

function ResponsiveValue({ value, tone = "" }) {
  return (
    <span
      className={`block min-w-0 max-w-full break-words text-left leading-tight font-black text-[clamp(10px,1.5vw,18px)] ${tone}`}
      title={value}
    >
      {value}
    </span>
  );
}

export default function Caja() {
  const { sessions, currentSession, form, message, setField, openCaja, closeCaja } = useCajaStore();
  const { cashEvents } = useAppDataStore();

  const computed = cashEvents.reduce(
    (acc, ev) => {
      if (ev.paymentMethod === "Efectivo") acc.cashSales += Number(ev.total || 0);
      if (ev.paymentMethod === "Tarjeta") acc.cardSales += Number(ev.total || 0);
      if (ev.paymentMethod === "Transferencia") acc.transferSales += Number(ev.total || 0);
      return acc;
    },
    { cashSales: 0, cardSales: 0, transferSales: 0 }
  );

  const openingAmount = Number(currentSession?.openingAmount || 0);
  const cashExpected = openingAmount + computed.cashSales;
  const cardCommission = computed.cardSales * 0.046;
  const countedCash = Number(form.countedCash || currentSession?.countedCash || 0);
  const difference = countedCash - cashExpected;

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[.95fr_1.15fr] gap-6">
      <section className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-6 shadow-soft">
        <h3 className="text-xl font-black mb-5">Caja</h3>

        <div className="space-y-4">
          <input
            value={form.openedBy}
            onChange={(e) => setField("openedBy", e.target.value)}
            className="input-pro"
            placeholder="Abierta por"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              value={form.openingAmount}
              onChange={(e) => setField("openingAmount", e.target.value)}
              className="input-pro"
              placeholder="Monto de apertura"
            />
            <input
              type="number"
              value={form.countedCash}
              onChange={(e) => setField("countedCash", e.target.value)}
              className="input-pro"
              placeholder="Efectivo contado al cierre"
            />
          </div>

          <input
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            className="input-pro"
            placeholder="Notas de caja"
          />

          <div className="flex flex-wrap gap-3">
            <button onClick={openCaja} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
              Abrir caja
            </button>
            <button onClick={closeCaja} className="rounded-2xl border border-dinamita-line px-5 py-3">
              Cerrar caja
            </button>
          </div>

          {message ? (
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3 text-sm">
              {message}
            </div>
          ) : null}
        </div>

        {currentSession ? (
          <div className="mt-6 rounded-3xl border border-dinamita-line bg-dinamita-panel2 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xl font-bold">Sesión actual</p>
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  currentSession.status === "Abierta"
                    ? "bg-green-500/15 text-green-300"
                    : "bg-zinc-500/15 text-zinc-300"
                }`}
              >
                {currentSession.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-dinamita-muted">Folio:</span> {currentSession.id}</div>
              <div><span className="text-dinamita-muted">Apertura:</span> {currentSession.openedAt}</div>
              <div><span className="text-dinamita-muted">Abrió:</span> {currentSession.openedBy}</div>
              <div><span className="text-dinamita-muted">Cierre:</span> {currentSession.closedAt || "-"}</div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-6">
        <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-5 shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 [&_.rounded-3xl]:min-w-0">
            <StatCard title="Apertura" value={money(openingAmount)} tone="neutral" />
            <StatCard title="Efectivo" value={money(computed.cashSales)} tone="green" />
            <StatCard title="Tarjeta" value={money(computed.cardSales)} tone="purple" />
            <StatCard title="Transferencia" value={money(computed.transferSales)} tone="blue" />
            <StatCard title="Comisión tarjeta" value={money(cardCommission)} hint="4.6%" tone="neutral" />
            <StatCard title="Esperado en caja" value={money(cashExpected)} tone="neutral" />
            <StatCard title="Contado" value={money(countedCash)} tone="neutral" />
            <StatCard
              title="Diferencia"
              value={money(difference)}
              tone={difference === 0 ? "neutral" : difference > 0 ? "green" : "red"}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Resumen de caja</h3>
            <span className="text-sm text-dinamita-muted">Valores responsivos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 p-4 min-w-0">
              <p className="text-sm text-dinamita-muted mb-2">Efectivo esperado</p>
              <ResponsiveValue value={money(cashExpected)} />
            </div>
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 p-4 min-w-0">
              <p className="text-sm text-dinamita-muted mb-2">Efectivo contado</p>
              <ResponsiveValue value={money(countedCash)} tone="text-green-300" />
            </div>
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 p-4 min-w-0">
              <p className="text-sm text-dinamita-muted mb-2">Total tarjeta</p>
              <ResponsiveValue value={money(computed.cardSales)} />
            </div>
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 p-4 min-w-0">
              <p className="text-sm text-dinamita-muted mb-2">Diferencia</p>
              <ResponsiveValue
                value={money(difference)}
                tone={difference === 0 ? "" : difference > 0 ? "text-green-300" : "text-red-300"}
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Historial de caja</h3>
            <span className="text-sm text-dinamita-muted">Sesiones recientes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-dinamita-muted">
                <tr>
                  <th className="pb-3">Folio</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3">Apertura</th>
                  <th className="pb-3">Cierre</th>
                  <th className="pb-3">Esperado</th>
                  <th className="pb-3">Contado</th>
                  <th className="pb-3 text-left">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((row) => (
                  <tr key={row.id} className="border-t border-dinamita-line">
                    <td className="py-3">{row.id}</td>
                    <td className="py-3">{row.status}</td>
                    <td className="py-3">{row.openedAt}</td>
                    <td className="py-3">{row.closedAt || "-"}</td>
                    <td className="py-3">{money(row.cashExpected || 0)}</td>
                    <td className="py-3">{money(row.countedCash || 0)}</td>
                    <td className="py-3 text-left font-semibold">{money(row.difference || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

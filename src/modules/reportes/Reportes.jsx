import { money } from "../../lib/format";
import StatCard from "../../components/ui/StatCard";
import { useReportsStore } from "../../store/reportsStore";
import { useAppDataStore } from "../../store/appDataStore";
import { useExpensesStore } from "../../store/expensesStore";

export default function Reportes() {
  const { filters, setFilter, rows: seedRows } = useReportsStore();
  const { sales, memberships } = useAppDataStore();
  const expensesRows = useExpensesStore((s) => s.expenses);

  const liveRows = [
    ...sales.map((sale) => ({
      id: sale.id,
      date: (sale.at || "").slice(0, 10),
      ticket: sale.id,
      client: sale.customerName || "Mostrador",
      type: "Venta",
      payment: sale.paymentMethod || "Efectivo",
      total: sale.total || 0,
    })),
    ...memberships
      .filter((m) => m.ticketId)
      .map((m) => ({
        id: m.id,
        date: m.createdAt ? m.createdAt.slice(0, 10) : m.inicio,
        ticket: m.ticketId || m.id,
        client: m.cliente,
        type: "Membresía",
        payment: m.pago || "Efectivo",
        total: m.monto || 0,
      })),
  ];

  const sourceRows = liveRows.length ? liveRows : seedRows;

  const rows = sourceRows.filter((row) => {
    const q = filters.query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      row.client.toLowerCase().includes(q) ||
      row.ticket.toLowerCase().includes(q) ||
      row.type.toLowerCase().includes(q);

    const matchesPayment = filters.payment === "Todos" || row.payment === filters.payment;
    const matchesType = filters.type === "Todos" || row.type === filters.type;

    return matchesQuery && matchesPayment && matchesType;
  });

  const expensesTotal = expensesRows.reduce((acc, row) => acc + Number(row.amount || 0), 0);

  const summary = rows.reduce(
    (acc, row) => {
      const total = Number(row.total || 0);
      acc.gross += total;
      if (row.payment === "Efectivo") acc.cash += total;
      if (row.payment === "Tarjeta") acc.card += total;
      if (row.payment === "Transferencia") acc.transfer += total;
      return acc;
    },
    { gross: 0, cash: 0, card: 0, transfer: 0, expenses: expensesTotal }
  );

  summary.cardCommission = summary.card * 0.046;
  summary.cardNet = summary.card - summary.cardCommission;
  summary.utility = summary.gross - summary.expenses - summary.cardCommission;

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-5 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-8 gap-4">
          <StatCard title="Ventas brutas" value={money(summary.gross)} tone="neutral" />
          <StatCard title="Efectivo" value={money(summary.cash)} tone="green" />
          <StatCard title="Tarjeta" value={money(summary.card)} tone="purple" />
          <StatCard title="Transferencia" value={money(summary.transfer)} tone="blue" />
          <StatCard title="Comisión tarjeta" value={money(summary.cardCommission)} hint="4.6%" tone="neutral" />
          <StatCard title="Neto tarjeta" value={money(summary.cardNet)} tone="neutral" />
          <StatCard title="Gastos" value={money(summary.expenses)} tone="neutral" />
          <StatCard title="Utilidad estimada" value={money(summary.utility)} tone="neutral" />
        </div>
      </div>

      <section className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-6 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h3 className="text-3xl font-black">Reportes</h3>
          <div className="flex gap-3">
            <button className="rounded-2xl border border-dinamita-line px-4 py-2 opacity-60 cursor-not-allowed">Excel</button>
            <button className="rounded-2xl bg-dinamita-red px-4 py-2 opacity-60 cursor-not-allowed">PDF</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <input
            value={filters.query}
            onChange={(e) => setFilter("query", e.target.value)}
            className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
            placeholder="Buscar cliente, ticket o tipo..."
          />

          <select
            value={filters.payment}
            onChange={(e) => setFilter("payment", e.target.value)}
            className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
          >
            <option>Todos</option>
            <option>Efectivo</option>
            <option>Tarjeta</option>
            <option>Transferencia</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilter("type", e.target.value)}
            className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
          >
            <option>Todos</option>
            <option>Venta</option>
            <option>Membresía</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-dinamita-muted">
              <tr>
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Ticket</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Pago</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-dinamita-line">
                  <td className="py-3">{row.date}</td>
                  <td className="py-3">{row.ticket}</td>
                  <td className="py-3">{row.client}</td>
                  <td className="py-3">{row.type}</td>
                  <td className="py-3">{row.payment}</td>
                  <td className="py-3 text-right font-semibold">{money(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!rows.length ? (
          <div className="mt-4 rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-4 text-dinamita-muted">
            No hay resultados con esos filtros.
          </div>
        ) : null}
      </section>
    </div>
  );
}

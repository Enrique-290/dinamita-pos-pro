import { useMemo, useState } from "react";
import { money } from "../../lib/format";
import { useAppDataStore } from "../../store/appDataStore";
import { useExpensesStore } from "../../store/expensesStore";
import { downloadCsv, printReport } from "../../lib/reportExport";

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function inRange(dateStr, from, to) {
  const d = String(dateStr || "").slice(0, 10);
  if (!d) return false;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function SummaryCard({ title, value, hint = "" }) {
  return (
    <article className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 p-4 min-w-0 overflow-hidden">
      <p className="text-sm text-dinamita-muted leading-tight">{title}</p>
      <p
        className="mt-3 min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap leading-none font-black text-[clamp(11px,1.2vw,17px)]"
        title={String(value)}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-dinamita-muted">{hint}</p> : null}
    </article>
  );
}

export default function Reportes() {
  const { sales, memberships } = useAppDataStore();
  const expensesRows = useExpensesStore((s) => s.expenses);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [payment, setPayment] = useState("Todos");
  const [type, setType] = useState("Todos");
  const [category, setCategory] = useState("Todos");
  const [productQuery, setProductQuery] = useState("");
  const [query, setQuery] = useState("");

  const reportData = useMemo(() => {
    const q = normalize(query);
    const pq = normalize(productQuery);

    const salesRows = sales.flatMap((sale) => {
      const saleDate = String(sale.at || "").slice(0, 10);
      if (!inRange(saleDate, dateFrom, dateTo)) return [];
      if (payment !== "Todos" && sale.paymentMethod !== payment) return [];
      if (!(type === "Todos" || type === "Venta")) return [];

      return (sale.items || []).filter((item) => {
        const matchesCategory = category === "Todos" || item.category === category || sale.category === category;
        const matchesProduct = !pq || normalize(item.name).includes(pq);
        const matchesQuery =
          !q ||
          normalize(sale.id).includes(q) ||
          normalize(sale.customerName).includes(q) ||
          normalize(sale.note).includes(q) ||
          normalize(item.name).includes(q);

        return matchesCategory && matchesProduct && matchesQuery;
      }).map((item) => ({
        Fecha: saleDate,
        Ticket: sale.id,
        Tipo: "Venta",
        Cliente: sale.customerName || "Mostrador",
        Producto: item.name,
        Categoria: item.category || sale.category || "-",
        Cantidad: Number(item.qty || 1),
        Precio: Number(item.price || 0),
        Total: Number(item.total || item.price || 0),
        Pago: sale.paymentMethod || "Efectivo",
      }));
    });

    const membershipRows = memberships
      .filter((m) => m.ticketId)
      .filter((m) => {
        const mDate = String(m.createdAt || m.inicio || "").slice(0, 10);
        if (!inRange(mDate, dateFrom, dateTo)) return false;
        if (payment !== "Todos" && m.pago !== payment) return false;
        if (!(type === "Todos" || type === "Membresía")) return false;
        if (!(!q || normalize(m.ticketId).includes(q) || normalize(m.cliente).includes(q) || normalize(m.tipo).includes(q))) return false;
        return true;
      })
      .map((m) => ({
        Fecha: String(m.createdAt || m.inicio || "").slice(0, 10),
        Ticket: m.ticketId || m.id,
        Tipo: "Membresía",
        Cliente: m.cliente,
        Producto: m.tipo,
        Categoria: "Membresía",
        Cantidad: 1,
        Precio: Number(m.monto || 0),
        Total: Number(m.monto || 0),
        Pago: m.pago || "Efectivo",
      }));

    const rows = [...salesRows, ...membershipRows];

    const gross = rows.reduce((acc, r) => acc + Number(r.Total || 0), 0);
    const cash = rows.filter((r) => r.Pago === "Efectivo").reduce((acc, r) => acc + Number(r.Total || 0), 0);
    const card = rows.filter((r) => r.Pago === "Tarjeta").reduce((acc, r) => acc + Number(r.Total || 0), 0);
    const transfer = rows.filter((r) => r.Pago === "Transferencia").reduce((acc, r) => acc + Number(r.Total || 0), 0);
    const expenses = expensesRows
      .filter((e) => inRange(e.date, dateFrom, dateTo))
      .reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const cardCommission = card * 0.046;
    const utility = gross - expenses - cardCommission;

    return { rows, gross, cash, card, transfer, expenses, cardCommission, utility };
  }, [sales, memberships, expensesRows, dateFrom, dateTo, payment, type, category, productQuery, query]);

  const handleExcel = () => {
    downloadCsv("reporte-dinamita.csv", reportData.rows);
  };

  const handlePdf = () => {
    printReport("Reporte Dinamita POS Pro", reportData.rows);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="soft-panel p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-8 gap-4">
          <SummaryCard title="Ventas brutas" value={money(reportData.gross)} />
          <SummaryCard title="Efectivo" value={money(reportData.cash)} />
          <SummaryCard title="Tarjeta" value={money(reportData.card)} />
          <SummaryCard title="Transferencia" value={money(reportData.transfer)} />
          <SummaryCard title="Comisión tarjeta" value={money(reportData.cardCommission)} hint="4.6%" />
          <SummaryCard title="Neto tarjeta" value={money(reportData.card - reportData.cardCommission)} />
          <SummaryCard title="Gastos" value={money(reportData.expenses)} />
          <SummaryCard title="Utilidad estimada" value={money(reportData.utility)} />
        </div>
      </div>

      <section className="soft-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h3 className="text-3xl font-black">Reportes</h3>
          <div className="flex gap-3">
            <button onClick={handleExcel} className="rounded-2xl border border-dinamita-line px-4 py-2">
              Exportar Excel
            </button>
            <button onClick={handlePdf} className="rounded-2xl bg-dinamita-red px-4 py-2 text-white">
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3 mb-5">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-pro" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-pro" />
          <select value={payment} onChange={(e) => setPayment(e.target.value)} className="input-pro">
            <option>Todos</option>
            <option>Efectivo</option>
            <option>Tarjeta</option>
            <option>Transferencia</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-pro">
            <option>Todos</option>
            <option>Venta</option>
            <option>Membresía</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-pro">
            <option>Todos</option>
            <option>Suplementos</option>
            <option>Bebidas</option>
            <option>Accesorios</option>
            <option>Membresía</option>
          </select>
          <input
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            className="input-pro"
            placeholder="Buscar producto..."
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-pro"
            placeholder="Buscador general..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-dinamita-muted">
              <tr>
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Ticket</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Producto</th>
                <th className="pb-3">Categoría</th>
                <th className="pb-3">Cantidad</th>
                <th className="pb-3">Precio</th>
                <th className="pb-3">Pago</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.rows.map((row, idx) => (
                <tr key={`${row.Ticket}-${row.Producto}-${idx}`} className="border-t border-dinamita-line">
                  <td className="py-3">{row.Fecha}</td>
                  <td className="py-3">{row.Ticket}</td>
                  <td className="py-3">{row.Tipo}</td>
                  <td className="py-3">{row.Cliente}</td>
                  <td className="py-3 font-medium">{row.Producto}</td>
                  <td className="py-3">{row.Categoria}</td>
                  <td className="py-3">{row.Cantidad}</td>
                  <td className="py-3">{money(row.Precio)}</td>
                  <td className="py-3">{row.Pago}</td>
                  <td className="py-3 text-right font-semibold">{money(row.Total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!reportData.rows.length ? (
          <div className="mt-4 rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-4 text-dinamita-muted">
            No hay resultados con esos filtros.
          </div>
        ) : null}
      </section>
    </div>
  );
}

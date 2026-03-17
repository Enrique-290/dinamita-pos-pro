import { useMemo, useState } from "react";
import StatCard from "../../components/ui/StatCard";
import { money } from "../../lib/format";
import { useAppDataStore } from "../../store/appDataStore";
import { useCajaStore } from "../../store/cajaStore";
import { useExpensesStore } from "../../store/expensesStore";
import { useInventoryStore } from "../../store/inventoryStore";
import { useClientsStore } from "../../store/clientsStore";

function groupByName(items = []) {
  const map = new Map();
  for (const item of items) {
    const prev = map.get(item.name) || { name: item.name, sold: 0, total: 0 };
    prev.sold += Number(item.qty || 1);
    prev.total += Number(item.total || item.price || 0);
    map.set(item.name, prev);
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 5);
}

function buildBars(total) {
  const safe = total > 0 ? total : 0;
  const raw = [0.35, 0.5, 0.42, 0.68, 0.54, 0.85, 1];
  return raw.map((r) => Math.max(20, Math.round(r * 90 * (safe > 0 ? 1 : 0.3))));
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function withinRange(dateStr, from, to) {
  if (!dateStr) return false;
  const d = String(dateStr).slice(0, 10);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

export default function Dashboard() {
  const { sales, memberships, cashEvents } = useAppDataStore();
  const { currentSession } = useCajaStore();
  const expensesRows = useExpensesStore((s) => s.expenses);
  const inventoryProducts = useInventoryStore((s) => s.products);
  const clients = useClientsStore((s) => s.clients);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [movementType, setMovementType] = useState("Todos");
  const [paymentType, setPaymentType] = useState("Todos");
  const [productQuery, setProductQuery] = useState("");
  const [generalQuery, setGeneralQuery] = useState("");

  const dashboardData = useMemo(() => {
    const gq = normalizeText(generalQuery);
    const pq = normalizeText(productQuery);

    const filteredSales = sales.filter((sale) => {
      const saleDate = String(sale.at || "").slice(0, 10);
      const matchesDate = withinRange(saleDate, dateFrom, dateTo);
      const matchesMovement = movementType === "Todos" || movementType === "Venta";
      const matchesPayment = paymentType === "Todos" || sale.paymentMethod === paymentType;

      const itemText = (sale.items || []).map((i) => i.name).join(" ");
      const matchesProduct = !pq || normalizeText(itemText).includes(pq);
      const matchesGeneral =
        !gq ||
        normalizeText(sale.customerName).includes(gq) ||
        normalizeText(sale.id).includes(gq) ||
        normalizeText(sale.note).includes(gq) ||
        normalizeText(itemText).includes(gq);

      return matchesDate && matchesMovement && matchesPayment && matchesProduct && matchesGeneral;
    });

    const filteredMemberships = memberships.filter((m) => {
      const mDate = String(m.createdAt || m.inicio || "").slice(0, 10);
      const matchesDate = withinRange(mDate, dateFrom, dateTo);
      const matchesMovement = movementType === "Todos" || movementType === "Membresía";
      const matchesPayment = paymentType === "Todos" || m.pago === paymentType;
      const matchesGeneral =
        !gq ||
        normalizeText(m.cliente).includes(gq) ||
        normalizeText(m.tipo).includes(gq) ||
        normalizeText(m.ticketId).includes(gq) ||
        normalizeText(m.notes).includes(gq);

      return matchesDate && matchesMovement && matchesPayment && matchesGeneral;
    });

    const salesTotal = filteredSales.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const membershipsCharged = filteredMemberships.filter((m) => m.ticketId);
    const membershipsTotal = membershipsCharged.reduce((acc, m) => acc + Number(m.monto || 0), 0);
    const gross = salesTotal + membershipsTotal;

    const eventFiltered = cashEvents.filter((e) => {
      const evDate = String(e.at || "").slice(0, 10);
      if (!withinRange(evDate, dateFrom, dateTo)) return false;
      if (paymentType !== "Todos" && e.paymentMethod !== paymentType) return false;
      return true;
    });

    const cash = eventFiltered
      .filter((e) => e.paymentMethod === "Efectivo")
      .reduce((acc, e) => acc + Number(e.total || 0), 0);

    const card = eventFiltered
      .filter((e) => e.paymentMethod === "Tarjeta")
      .reduce((acc, e) => acc + Number(e.total || 0), 0);

    const transfer = eventFiltered
      .filter((e) => e.paymentMethod === "Transferencia")
      .reduce((acc, e) => acc + Number(e.total || 0), 0);

    const expensesFiltered = expensesRows.filter((row) => withinRange(row.date, dateFrom, dateTo));
    const expenses = expensesFiltered.reduce((acc, row) => acc + Number(row.amount || 0), 0);
    const commission = card * 0.046;
    const utility = gross - expenses - commission;

    const topProducts = groupByName(filteredSales.flatMap((s) => s.items || []));
    const dueMemberships = filteredMemberships
      .slice()
      .sort((a, b) => String(a.fin).localeCompare(String(b.fin)))
      .slice(0, 5);

    const expenseRowsFiltered = expensesFiltered.slice(0, 5).map((row) => [row.date, row.concept, row.amount]);
    const stockRows = inventoryProducts
      .filter((p) => Number(p.stock || 0) <= 10)
      .filter((p) => !pq || normalizeText(p.name).includes(pq))
      .slice(0, 5)
      .map((p) => [p.name, p.stock, p.cost || 0, p.price || 0]);

    const activeClients = clients.filter((c) => c.active !== false).length;
    const chargedMembershipsCount = membershipsCharged.length;
    const bars = buildBars(gross);

    return {
      gross,
      cash,
      card,
      transfer,
      expenses,
      commission,
      utility,
      topProducts,
      dueMemberships,
      expenseRowsFiltered,
      stockRows,
      activeClients,
      chargedMembershipsCount,
      ticketCount: filteredSales.length + membershipsCharged.length,
      bars,
    };
  }, [
    sales,
    memberships,
    cashEvents,
    expensesRows,
    inventoryProducts,
    clients,
    dateFrom,
    dateTo,
    movementType,
    paymentType,
    productQuery,
    generalQuery,
  ]);

  return (
    <div className="p-6 space-y-6">
      <section>
        <p className="text-4xl font-black">Hola Santiago</p>
        <p className="text-xl text-dinamita-muted mt-2">Hoy es una buena sesión para vender y cerrar bien.</p>
        <p className="text-sm text-dinamita-muted mt-3">
          Caja: {currentSession?.status || "Sin abrir"} · {currentSession?.openedAt || "Sin sesión activa"}
        </p>
      </section>

      <section className="soft-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Filtros de dashboard</h3>
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setMovementType("Todos");
              setPaymentType("Todos");
              setProductQuery("");
              setGeneralQuery("");
            }}
            className="rounded-2xl border border-dinamita-line px-4 py-2"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-pro" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-pro" />

          <select value={movementType} onChange={(e) => setMovementType(e.target.value)} className="input-pro">
            <option>Todos</option>
            <option>Venta</option>
            <option>Membresía</option>
          </select>

          <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className="input-pro">
            <option>Todos</option>
            <option>Efectivo</option>
            <option>Tarjeta</option>
            <option>Transferencia</option>
          </select>

          <input
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            className="input-pro"
            placeholder="Buscar producto..."
          />

          <input
            value={generalQuery}
            onChange={(e) => setGeneralQuery(e.target.value)}
            className="input-pro"
            placeholder="Buscador general..."
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Venta del periodo" value={money(dashboardData.gross)} tone="neutral" hint="Ventas + membresías cobradas" />
        <StatCard title="Efectivo" value={money(dashboardData.cash)} tone="green" />
        <StatCard title="Tarjeta" value={money(dashboardData.card)} tone="purple" />
        <StatCard title="Transferencia" value={money(dashboardData.transfer)} tone="blue" />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Utilidad estimada" value={money(dashboardData.utility)} tone="neutral" />
        <StatCard title="Gastos" value={money(dashboardData.expenses)} tone="neutral" />
        <StatCard title="Clientes activos / Tickets" value={`${dashboardData.activeClients} / ${dashboardData.ticketCount}`} tone="neutral" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Ventas del periodo</h3>
            <span className="text-sm text-dinamita-muted">Filtrado</span>
          </div>
          <div className="flex items-end gap-2 h-28 pt-6">
            {dashboardData.bars.map((h, i) => (
              <div key={i} className="w-8 rounded-t-xl bg-dinamita-red" style={{ height: `${h}px`, opacity: i < 4 ? 0.7 : 1 }} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Métodos de pago</h3>
            <span className="text-sm text-dinamita-muted">Filtrado</span>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-6 items-center mt-5">
            <div className="mx-auto h-32 w-32 rounded-full border-[18px] border-emerald-500 relative">
              <div className="absolute inset-0 rounded-full border-t-[18px] border-fuchsia-500 border-r-[18px] border-indigo-500 border-l-[18px] border-transparent border-b-[18px] border-transparent rotate-45" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-dinamita-muted">Efectivo</span><span>{money(dashboardData.cash)}</span></div>
              <div className="flex justify-between"><span className="text-dinamita-muted">Tarjeta</span><span>{money(dashboardData.card)}</span></div>
              <div className="flex justify-between"><span className="text-dinamita-muted">Transferencia</span><span>{money(dashboardData.transfer)}</span></div>
              <div className="flex justify-between"><span className="text-dinamita-muted">Comisión tarjeta</span><span>{money(dashboardData.commission)}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-5 shadow-soft">
          <h3 className="text-2xl font-bold mb-4">Productos más vendidos</h3>
          <div className="space-y-4">
            {(dashboardData.topProducts.length ? dashboardData.topProducts : [{ name: "Sin ventas aún", sold: 0, total: 0 }]).map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl bg-dinamita-panel2 border border-dinamita-line px-4 py-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-dinamita-muted mt-1">{item.sold} vendidos</p>
                </div>
                <div className="text-right font-bold">{money(item.total)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-5 shadow-soft">
          <h3 className="text-2xl font-bold mb-4">Membresías recientes</h3>
          <div className="space-y-4">
            {(dashboardData.dueMemberships.length ? dashboardData.dueMemberships : []).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-dinamita-panel2 border border-dinamita-line px-4 py-4">
                <div>
                  <p className="font-semibold">{item.cliente}</p>
                  <p className="text-sm text-dinamita-muted mt-1">{item.pago} · {item.fin}</p>
                </div>
                <div className="text-right font-bold">{money(item.monto)}</div>
              </div>
            ))}
            {!dashboardData.dueMemberships.length ? (
              <div className="rounded-2xl bg-dinamita-panel2 border border-dinamita-line px-4 py-4 text-dinamita-muted">
                No hay membresías registradas con esos filtros.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-5 shadow-soft">
          <h3 className="text-2xl font-bold mb-4">Últimos gastos</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-dinamita-muted">
              <tr><th className="pb-3">Fecha</th><th className="pb-3">Concepto</th><th className="pb-3 text-right">Monto</th></tr>
            </thead>
            <tbody>
              {(dashboardData.expenseRowsFiltered.length ? dashboardData.expenseRowsFiltered : [["-", "Sin gastos aún", 0]]).map(([f, c, m]) => (
                <tr key={f + c} className="border-t border-dinamita-line">
                  <td className="py-3">{f}</td>
                  <td className="py-3">{c}</td>
                  <td className="py-3 text-right font-semibold">{money(m)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-5 shadow-soft">
          <h3 className="text-2xl font-bold mb-4">Stock bajo</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-dinamita-muted">
              <tr><th className="pb-3">Producto</th><th className="pb-3">Stock</th><th className="pb-3">Costo</th><th className="pb-3">Venta</th></tr>
            </thead>
            <tbody>
              {(dashboardData.stockRows.length ? dashboardData.stockRows : [["Sin alertas", 0, 0, 0]]).map(([n, s, c, v]) => (
                <tr key={n} className="border-t border-dinamita-line">
                  <td className="py-3 font-medium">{n}</td>
                  <td className="py-3">{s}</td>
                  <td className="py-3">{money(c)}</td>
                  <td className="py-3 font-semibold">{money(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

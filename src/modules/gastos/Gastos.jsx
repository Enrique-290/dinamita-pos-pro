import { money } from "../../lib/format";
import { useExpensesStore } from "../../store/expensesStore";

const categories = ["Todos", "Proveedor", "Servicios", "Operación", "Mantenimiento", "Otros"];
const payments = ["Todos", "Efectivo", "Tarjeta", "Transferencia"];

export default function Gastos() {
  const {
    form,
    query,
    categoryFilter,
    paymentFilter,
    message,
    setField,
    setQuery,
    setCategoryFilter,
    setPaymentFilter,
    editExpense,
    resetForm,
    saveExpense,
    deleteExpense,
    getFilteredExpenses,
  } = useExpensesStore();

  const rows = getFilteredExpenses();
  const total = rows.reduce((acc, row) => acc + Number(row.amount || 0), 0);

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[.95fr_1.15fr] gap-6">
      <section className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-6 shadow-soft">
        <h3 className="text-3xl font-black mb-5">Gastos</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
            />
            <select
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
            >
              <option>Proveedor</option>
              <option>Servicios</option>
              <option>Operación</option>
              <option>Mantenimiento</option>
              <option>Otros</option>
            </select>
          </div>

          <input
            value={form.concept}
            onChange={(e) => setField("concept", e.target.value)}
            className="w-full rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
            placeholder="Concepto del gasto"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setField("amount", e.target.value)}
              className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
              placeholder="Monto"
            />
            <select
              value={form.paymentMethod}
              onChange={(e) => setField("paymentMethod", e.target.value)}
              className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
            >
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
            </select>
          </div>

          <input
            value={form.note}
            onChange={(e) => setField("note", e.target.value)}
            className="w-full rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
            placeholder="Nota"
          />

          <div className="flex flex-wrap gap-3">
            <button onClick={resetForm} className="rounded-2xl border border-dinamita-line px-5 py-3">
              Limpiar
            </button>
            <button onClick={saveExpense} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
              Guardar gasto
            </button>
          </div>

          {message ? (
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3 text-sm">
              {message}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-6 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h3 className="text-2xl font-bold">Listado de gastos</h3>
          <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3 font-semibold">
            Total: {money(total)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
            placeholder="Buscar concepto..."
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
          >
            {payments.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-dinamita-muted">
              <tr>
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Categoría</th>
                <th className="pb-3">Concepto</th>
                <th className="pb-3">Pago</th>
                <th className="pb-3">Nota</th>
                <th className="pb-3">Monto</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-dinamita-line">
                  <td className="py-3">{row.date}</td>
                  <td className="py-3">{row.category}</td>
                  <td className="py-3 font-medium">{row.concept}</td>
                  <td className="py-3">{row.paymentMethod}</td>
                  <td className="py-3">{row.note || "-"}</td>
                  <td className="py-3 font-semibold">{money(row.amount)}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => editExpense(row)} className="rounded-xl border border-dinamita-line px-3 py-1">
                        Editar
                      </button>
                      <button onClick={() => deleteExpense(row.id)} className="rounded-xl border border-dinamita-line px-3 py-1">
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

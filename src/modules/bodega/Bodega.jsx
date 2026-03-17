import { useBodegaStore } from "../../store/bodegaStore";
import { useInventoryStore } from "../../store/inventoryStore";

const types = ["Todos", "Entrada", "Salida", "Ajuste"];

export default function Bodega() {
  const products = useInventoryStore((s) => s.products);
  const {
    form,
    query,
    typeFilter,
    message,
    setField,
    setQuery,
    setTypeFilter,
    resetForm,
    saveMove,
    getFilteredMoves,
  } = useBodegaStore();

  const rows = getFilteredMoves();

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[.95fr_1.15fr] gap-6">
      <section className="soft-panel p-6">
        <h3 className="text-3xl font-black mb-5">Bodega</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              className="input-pro"
            />
            <select
              value={form.type}
              onChange={(e) => setField("type", e.target.value)}
              className="input-pro"
            >
              <option>Entrada</option>
              <option>Salida</option>
              <option>Ajuste</option>
            </select>
          </div>

          <select
            value={form.productId}
            onChange={(e) => setField("productId", e.target.value)}
            className="input-pro"
          >
            <option value="">Selecciona producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · Stock {product.stock}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={form.qty}
              onChange={(e) => setField("qty", e.target.value)}
              className="input-pro"
              placeholder="Cantidad"
            />
            <input
              value={form.reason}
              onChange={(e) => setField("reason", e.target.value)}
              className="input-pro"
              placeholder="Motivo"
            />
          </div>

          <input
            value={form.note}
            onChange={(e) => setField("note", e.target.value)}
            className="input-pro"
            placeholder="Nota"
          />

          <div className="flex flex-wrap gap-3">
            <button onClick={resetForm} className="rounded-2xl border border-dinamita-line px-5 py-3">
              Limpiar
            </button>
            <button onClick={saveMove} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
              Guardar movimiento
            </button>
          </div>

          {message ? (
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3 text-sm">
              {message}
            </div>
          ) : null}
        </div>
      </section>

      <section className="soft-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h3 className="text-2xl font-bold">Movimientos de bodega</h3>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-pro md:max-w-sm"
            placeholder="Buscar producto o motivo..."
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          {types.map((tab) => (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`rounded-2xl border px-4 py-2 ${
                typeFilter === tab
                  ? "bg-dinamita-red border-dinamita-red text-white"
                  : "border-dinamita-line bg-dinamita-panel2"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-dinamita-muted">
              <tr>
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Producto</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Cantidad</th>
                <th className="pb-3">Motivo</th>
                <th className="pb-3">Nota</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-dinamita-line">
                  <td className="py-3">{row.date}</td>
                  <td className="py-3 font-medium">{row.productName}</td>
                  <td className="py-3">{row.type}</td>
                  <td className="py-3">{row.qty}</td>
                  <td className="py-3">{row.reason || "-"}</td>
                  <td className="py-3">{row.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

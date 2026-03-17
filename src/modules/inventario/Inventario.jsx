import { money } from "../../lib/format";
import { useInventoryStore } from "../../store/inventoryStore";

const categories = ["Todos", "Suplementos", "Bebidas", "Accesorios"];

export default function Inventario() {
  const {
    form,
    query,
    categoryFilter,
    message,
    setField,
    setQuery,
    setCategoryFilter,
    editProduct,
    resetForm,
    saveProduct,
    deleteProduct,
    getFilteredProducts,
  } = useInventoryStore();

  const rows = getFilteredProducts();

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[.9fr_1.2fr] gap-6">
      <section className="soft-panel p-6">
        <h3 className="text-3xl font-black mb-5">Inventario</h3>

        <div className="space-y-4">
          <input
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="input-pro"
            placeholder="Nombre del producto"
          />

          <input
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            className="input-pro"
            placeholder="Descripción"
          />

          <input
            value={form.image}
            onChange={(e) => setField("image", e.target.value)}
            className="input-pro"
            placeholder="URL de imagen"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              className="input-pro"
            >
              <option>Suplementos</option>
              <option>Bebidas</option>
              <option>Accesorios</option>
            </select>

            <input
              value={form.barcode}
              onChange={(e) => setField("barcode", e.target.value)}
              className="input-pro"
              placeholder="Código de barras"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              value={form.cost}
              onChange={(e) => setField("cost", e.target.value)}
              className="input-pro"
              placeholder="Costo"
            />
            <input
              type="number"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              className="input-pro"
              placeholder="Precio"
            />
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setField("stock", e.target.value)}
              className="input-pro"
              placeholder="Stock"
            />
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={!!form.active}
              onChange={(e) => setField("active", e.target.checked)}
            />
            Producto activo
          </label>

          <div className="flex flex-wrap gap-3">
            <button onClick={resetForm} className="rounded-2xl border border-dinamita-line px-5 py-3">
              Limpiar
            </button>
            <button onClick={saveProduct} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
              Guardar producto
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
          <h3 className="text-2xl font-bold">Productos</h3>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-pro md:max-w-sm"
            placeholder="Buscar nombre o código..."
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => setCategoryFilter(tab)}
              className={`rounded-2xl border px-4 py-2 ${
                categoryFilter === tab
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
                <th className="pb-3">Producto</th>
                <th className="pb-3">Categoría</th>
                <th className="pb-3">Código</th>
                <th className="pb-3">Costo</th>
                <th className="pb-3">Precio</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-dinamita-line">
                  <td className="py-3 font-medium">{row.name}</td>
                  <td className="py-3">{row.category}</td>
                  <td className="py-3">{row.barcode || "-"}</td>
                  <td className="py-3">{money(row.cost)}</td>
                  <td className="py-3 font-semibold">{money(row.price)}</td>
                  <td className="py-3">{row.stock}</td>
                  <td className="py-3">{row.active ? "Activo" : "Inactivo"}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => editProduct(row)} className="rounded-xl border border-dinamita-line px-3 py-1">
                        Editar
                      </button>
                      <button onClick={() => deleteProduct(row.id)} className="rounded-xl border border-dinamita-line px-3 py-1">
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

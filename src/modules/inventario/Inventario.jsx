import { useRef } from "react";
import { money } from "../../lib/format";
import { useInventoryStore } from "../../store/inventoryStore";

const placeholderImage = "https://via.placeholder.com/80x80?text=Producto";

export default function Inventario() {
  const {
    form,
    categoryForm,
    categories,
    query,
    categoryFilter,
    stockAddQty,
    stockAddProductId,
    message,
    isCategoryManagerOpen,
    setField,
    setQuery,
    setCategoryFilter,
    setStockAddQty,
    setStockAddProductId,
    editProduct,
    resetForm,
    saveProduct,
    deleteProduct,
    addStockToProduct,
    openCategoryManager,
    closeCategoryManager,
    setCategoryFormField,
    editCategory,
    resetCategoryForm,
    saveCategory,
    deleteCategory,
    getFilteredProducts,
  } = useInventoryStore();

  const rows = getFilteredProducts();
  const fileRef = useRef(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setField("image", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[.95fr_1.2fr] gap-6">
      <section className="soft-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="text-3xl font-black">Inventario</h3>
          <button onClick={openCategoryManager} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
            Agregar / administrar categorías
          </button>
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 items-center">
            <div className="h-24 w-24 rounded-2xl overflow-hidden border border-dinamita-line bg-dinamita-panel2">
              <img
                src={form.image || placeholderImage}
                alt="preview"
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.src = placeholderImage; }}
              />
            </div>
            <div className="space-y-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-2xl border border-dinamita-line px-5 py-3"
              >
                Subir imagen desde dispositivo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              <input
                value={form.image}
                onChange={(e) => setField("image", e.target.value)}
                className="input-pro"
                placeholder="o pega URL de imagen"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              className="input-pro"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            <input
              value={form.barcode}
              onChange={(e) => setField("barcode", e.target.value)}
              className="input-pro"
              placeholder="Código de barras"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            <input
              type="number"
              value={form.minStock}
              onChange={(e) => setField("minStock", e.target.value)}
              className="input-pro"
              placeholder="Stock mínimo"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setField("expiryDate", e.target.value)}
              className="input-pro"
            />
            <input
              value={form.lot}
              onChange={(e) => setField("lot", e.target.value)}
              className="input-pro"
              placeholder="Lote"
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
            placeholder="Buscar nombre, lote o código..."
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <button
            onClick={() => setCategoryFilter("Todos")}
            className={`rounded-2xl border px-4 py-2 ${categoryFilter === "Todos" ? "bg-dinamita-red border-dinamita-red text-white" : "border-dinamita-line bg-dinamita-panel2"}`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-2xl border px-4 py-2 ${categoryFilter === cat ? "bg-dinamita-red border-dinamita-red text-white" : "border-dinamita-line bg-dinamita-panel2"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-5 rounded-2xl border border-dinamita-line bg-dinamita-panel2 p-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_160px] gap-3 items-end">
            <select
              value={stockAddProductId || ""}
              onChange={(e) => setStockAddProductId(Number(e.target.value) || null)}
              className="input-pro"
            >
              <option value="">Selecciona producto para agregar stock</option>
              {rows.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name} · Stock actual {row.stock}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={stockAddQty}
              onChange={(e) => setStockAddQty(e.target.value)}
              className="input-pro"
              placeholder="Cantidad"
            />
            <button onClick={addStockToProduct} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
              Agregar stock
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-dinamita-muted">
              <tr>
                <th className="pb-3">Img</th>
                <th className="pb-3">Producto</th>
                <th className="pb-3">Categoría</th>
                <th className="pb-3">Lote</th>
                <th className="pb-3">Caducidad</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Mínimo</th>
                <th className="pb-3">Precio</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-dinamita-line">
                  <td className="py-3">
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-dinamita-line bg-dinamita-panel2">
                      <img
                        src={row.image || placeholderImage}
                        alt={row.name}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.src = placeholderImage; }}
                      />
                    </div>
                  </td>
                  <td className="py-3">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-dinamita-muted">{row.description || "-"}</p>
                  </td>
                  <td className="py-3">{row.category}</td>
                  <td className="py-3">{row.lot || "-"}</td>
                  <td className="py-3">{row.expiryDate || "-"}</td>
                  <td className={`py-3 font-semibold ${Number(row.stock || 0) <= Number(row.minStock || 0) ? "text-red-300" : ""}`}>
                    {row.stock}
                  </td>
                  <td className="py-3">{row.minStock || 0}</td>
                  <td className="py-3 font-semibold">{money(row.price)}</td>
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

      {isCategoryManagerOpen ? (
        <section className="xl:col-span-2 soft-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h3 className="text-2xl font-bold">Administrador de categorías</h3>
            <button onClick={closeCategoryManager} className="rounded-2xl border border-dinamita-line px-4 py-2">
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[.8fr_1.2fr] gap-6">
            <div className="space-y-4">
              <input
                value={categoryForm.name}
                onChange={(e) => setCategoryFormField("name", e.target.value)}
                className="input-pro"
                placeholder="Nombre de categoría"
              />
              <div className="flex flex-wrap gap-3">
                <button onClick={resetCategoryForm} className="rounded-2xl border border-dinamita-line px-5 py-3">
                  Limpiar
                </button>
                <button onClick={saveCategory} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
                  Guardar categoría
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-dinamita-muted">
                  <tr>
                    <th className="pb-3">Categoría</th>
                    <th className="pb-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => (
                    <tr key={cat} className="border-t border-dinamita-line">
                      <td className="py-3 font-medium">{cat}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => editCategory(idx, cat)} className="rounded-xl border border-dinamita-line px-3 py-1">
                            Editar
                          </button>
                          <button onClick={() => deleteCategory(idx)} className="rounded-xl border border-dinamita-line px-3 py-1">
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

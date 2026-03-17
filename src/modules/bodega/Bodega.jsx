import { useRef, useState } from "react";
import { money } from "../../lib/format";
import { useInventoryStore } from "../../store/inventoryStore";
import { useBodegaStore } from "../../store/bodegaStore";

const placeholderImage = "https://via.placeholder.com/80x80?text=Bodega";
const moveTypes = ["Todos", "Entrada a bodega", "Traspaso a inventario", "Salida de bodega"];

export default function Bodega() {
  const categories = useInventoryStore((s) => s.categories || []);
  const {
    warehouseForm,
    transferForm,
    query,
    moveFilter,
    message,
    setWarehouseField,
    setTransferField,
    setQuery,
    setMoveFilter,
    resetWarehouseForm,
    resetTransferForm,
    addToWarehouse,
    transferToInventory,
    getFilteredWarehouseItems,
    getFilteredMoves,
  } = useBodegaStore();

  const [outQtyById, setOutQtyById] = useState({});
  const fileRef = useRef(null);

  const items = getFilteredWarehouseItems();
  const moves = getFilteredMoves();

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setWarehouseField("image", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-6">
      <section className="soft-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="text-3xl font-black">Bodega</h3>
          <span className="badge-chip">Resguardo separado de Inventario</span>
        </div>

        <div className="space-y-4">
          <input
            value={warehouseForm.name}
            onChange={(e) => setWarehouseField("name", e.target.value)}
            className="input-pro"
            placeholder="Nombre del producto en bodega"
          />
          <input
            value={warehouseForm.description}
            onChange={(e) => setWarehouseField("description", e.target.value)}
            className="input-pro"
            placeholder="Descripción"
          />

          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 items-center">
            <div className="h-24 w-24 rounded-2xl overflow-hidden border border-dinamita-line bg-dinamita-panel2">
              <img
                src={warehouseForm.image || placeholderImage}
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
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <input
                value={warehouseForm.image}
                onChange={(e) => setWarehouseField("image", e.target.value)}
                className="input-pro"
                placeholder="o pega URL de imagen"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={warehouseForm.category}
              onChange={(e) => setWarehouseField("category", e.target.value)}
              className="input-pro"
            >
              {(categories.length ? categories : ["General"]).map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <input
              value={warehouseForm.barcode}
              onChange={(e) => setWarehouseField("barcode", e.target.value)}
              className="input-pro"
              placeholder="Código de barras"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input
              type="number"
              value={warehouseForm.cost}
              onChange={(e) => setWarehouseField("cost", e.target.value)}
              className="input-pro"
              placeholder="Costo"
            />
            <input
              type="number"
              value={warehouseForm.price}
              onChange={(e) => setWarehouseField("price", e.target.value)}
              className="input-pro"
              placeholder="Precio sugerido"
            />
            <input
              type="number"
              value={warehouseForm.qty}
              onChange={(e) => setWarehouseField("qty", e.target.value)}
              className="input-pro"
              placeholder="Pzas en bodega"
            />
            <input
              type="number"
              value={warehouseForm.minStock}
              onChange={(e) => setWarehouseField("minStock", e.target.value)}
              className="input-pro"
              placeholder="Stock mínimo"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={warehouseForm.expiryDate}
              onChange={(e) => setWarehouseField("expiryDate", e.target.value)}
              className="input-pro"
            />
            <input
              value={warehouseForm.lot}
              onChange={(e) => setWarehouseField("lot", e.target.value)}
              className="input-pro"
              placeholder="Lote"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={resetWarehouseForm} className="rounded-2xl border border-dinamita-line px-5 py-3">
              Limpiar
            </button>
            <button onClick={addToWarehouse} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
              Guardar en bodega
            </button>
          </div>

          <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 p-4">
            <h4 className="font-bold mb-2">Enviar manualmente a inventario</h4>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_1fr_auto] gap-3">
              <select
                value={transferForm.warehouseId}
                onChange={(e) => setTransferField("warehouseId", e.target.value)}
                className="input-pro"
              >
                <option value="">Selecciona producto de bodega</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · Bodega {item.qty}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={transferForm.qty}
                onChange={(e) => setTransferField("qty", e.target.value)}
                className="input-pro"
                placeholder="Pzas"
              />
              <input
                value={transferForm.reason}
                onChange={(e) => setTransferField("reason", e.target.value)}
                className="input-pro"
                placeholder="Motivo del surtido"
              />
              <button onClick={transferToInventory} className="rounded-2xl bg-dinamita-red px-4 py-3 font-bold">
                Enviar
              </button>
            </div>
            <p className="text-xs text-dinamita-muted mt-3">
              Bodega resguarda el producto. Solo pasa a Inventario cuando tú lo envías manualmente.
            </p>
          </div>

          {message ? (
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3 text-sm">
              {message}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-6">
        <div className="soft-panel p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <h3 className="text-2xl font-bold">Stock resguardado en bodega</h3>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-pro md:max-w-sm"
              placeholder="Buscar producto, lote o código..."
            />
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
                  <th className="pb-3">Bodega</th>
                  <th className="pb-3">Costo</th>
                  <th className="pb-3">Precio</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-dinamita-line">
                    <td className="py-3">
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-dinamita-line bg-dinamita-panel2">
                        <img
                          src={item.image || placeholderImage}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.src = placeholderImage; }}
                        />
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-dinamita-muted">{item.description || "-"}</p>
                    </td>
                    <td className="py-3">{item.category}</td>
                    <td className="py-3">{item.lot || "-"}</td>
                    <td className="py-3">{item.expiryDate || "-"}</td>
                    <td className="py-3 font-semibold">{item.qty}</td>
                    <td className="py-3">{money(item.cost)}</td>
                    <td className="py-3">{money(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!items.length ? (
            <div className="mt-4 rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-4 text-dinamita-muted">
              Aún no hay productos resguardados en bodega.
            </div>
          ) : null}
        </div>

        <div className="soft-panel p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <h3 className="text-2xl font-bold">Historial de movimientos</h3>
            <div className="flex flex-wrap gap-2">
              {moveTypes.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMoveFilter(tab)}
                  className={`rounded-2xl border px-4 py-2 ${
                    moveFilter === tab
                      ? "bg-dinamita-red border-dinamita-red text-white"
                      : "border-dinamita-line bg-dinamita-panel2"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-dinamita-muted">
                <tr>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Movimiento</th>
                  <th className="pb-3">Producto</th>
                  <th className="pb-3">Pzas</th>
                  <th className="pb-3">Motivo</th>
                  <th className="pb-3">Nota</th>
                </tr>
              </thead>
              <tbody>
                {moves.map((row) => (
                  <tr key={row.id} className="border-t border-dinamita-line">
                    <td className="py-3">{row.date}</td>
                    <td className="py-3">{row.type}</td>
                    <td className="py-3 font-medium">{row.productName}</td>
                    <td className="py-3">{row.qty}</td>
                    <td className="py-3">{row.reason || "-"}</td>
                    <td className="py-3">{row.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!moves.length ? (
            <div className="mt-4 rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-4 text-dinamita-muted">
              Aún no hay movimientos de bodega.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

import { useMemo, useState } from "react";
import { money } from "../../lib/format";
import { printTicket } from "../../lib/ticketPrinter";
import { useSalesStore } from "../../store/salesStore";
import { useInventoryStore } from "../../store/inventoryStore";
import { useClientsStore } from "../../store/clientsStore";
import { useAppDataStore } from "../../store/appDataStore";

const categories = ["Todos", "Suplementos", "Bebidas", "Accesorios"];
const placeholderImage = "https://via.placeholder.com/300x220?text=Producto";

export default function Ventas() {
  const inventoryProducts = useInventoryStore((s) => s.products);
  const clients = useClientsStore((s) => s.clients).filter((c) => c.active !== false);
  const lastTicket = useAppDataStore((s) => s.lastTicket);

  const {
    cart,
    paymentMethod,
    note,
    customerName,
    lastSale,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    setPaymentMethod,
    setNote,
    setCustomerName,
    clearSale,
    checkout,
  } = useSalesStore();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [message, setMessage] = useState("");

  const filteredProducts = useMemo(() => {
    return inventoryProducts.filter((product) => {
      const matchQuery =
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        String(product.barcode || "").toLowerCase().includes(query.toLowerCase()) ||
        String(product.description || "").toLowerCase().includes(query.toLowerCase());
      const matchCategory = activeCategory === "Todos" || product.category === activeCategory;
      return matchQuery && matchCategory && product.active !== false;
    });
  }, [inventoryProducts, query, activeCategory]);

  const total = cart.reduce((acc, item) => acc + item.total, 0);

  const handleAdd = (product) => {
    const currentQty = cart.find((item) => item.id === product.id)?.qty || 0;
    if (Number(product.stock || 0) <= currentQty) {
      setMessage(`No hay más stock disponible para ${product.name}.`);
      return;
    }
    addToCart(product);
    setMessage("");
  };

  const handleIncrease = (itemId) => {
    const product = inventoryProducts.find((p) => p.id === itemId);
    const item = cart.find((c) => c.id === itemId);
    if (!product || !item) return;
    if (Number(item.qty || 0) >= Number(product.stock || 0)) {
      setMessage(`Stock máximo alcanzado para ${product.name}.`);
      return;
    }
    increaseQty(itemId);
    setMessage("");
  };

  const handleCheckout = () => {
    const sale = checkout();
    if (!sale) {
      setMessage("Agrega al menos un producto al carrito.");
      return;
    }
    setMessage(`Venta registrada: ${sale.id} · ${sale.paymentMethod} · ${money(sale.total)}`);
  };

  const handleDirectPrint = () => {
    if (!lastTicket) {
      setMessage("Primero realiza una venta para imprimir.");
      return;
    }
    printTicket(lastTicket);
    setMessage("Enviando ticket a impresión.");
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[1.45fr_.95fr] gap-6">
      <section className="soft-panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
          <h3 className="text-3xl font-black">Ventas</h3>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-pro w-full md:max-w-lg"
            placeholder="Buscar producto..."
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`rounded-2xl border px-4 py-2 ${
                activeCategory === tab
                  ? "bg-dinamita-red border-dinamita-red text-white"
                  : "border-dinamita-line bg-dinamita-panel2"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <article key={product.id} className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 overflow-hidden">
              <div className="aspect-[4/3] bg-zinc-900/30">
                <img
                  src={product.image || placeholderImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = placeholderImage;
                  }}
                />
              </div>

              <div className="p-4">
                <p className="text-lg font-bold leading-tight">{product.name}</p>
                <p className="text-xs text-dinamita-muted mt-2 line-clamp-2 min-h-[32px]">
                  {product.description || "Sin descripción"}
                </p>
                <p className="text-xs text-dinamita-muted mt-2">
                  {product.category} · Stock: {product.stock}
                </p>

                <div className="flex items-center justify-between mt-4 gap-3">
                  <span className="text-2xl font-black">{money(product.price)}</span>
                  <button
                    onClick={() => handleAdd(product)}
                    className={`rounded-2xl px-4 py-2 text-sm font-bold ${
                      Number(product.stock || 0) > 0 ? "bg-dinamita-red" : "bg-zinc-700 cursor-not-allowed"
                    }`}
                  >
                    {Number(product.stock || 0) > 0 ? "Agregar" : "Sin stock"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="soft-panel p-6">
        <h3 className="text-3xl font-black mb-5">Carrito</h3>

        <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
          {cart.length ? (
            cart.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-4"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-dinamita-muted mt-1">{money(item.price)} c/u</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm text-dinamita-muted hover:text-white"
                  >
                    Quitar
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="h-9 w-9 rounded-xl border border-dinamita-line"
                    >
                      -
                    </button>
                    <span className="min-w-8 text-center font-bold">{item.qty}</span>
                    <button
                      onClick={() => handleIncrease(item.id)}
                      className="h-9 w-9 rounded-xl border border-dinamita-line"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold">{money(item.total)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-6 text-dinamita-muted">
              El carrito está vacío.
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <select
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="input-pro"
          >
            <option value="Mostrador">Mostrador</option>
            {clients.map((client) => (
              <option key={client.id} value={client.name}>
                {client.name}
              </option>
            ))}
          </select>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input-pro"
            placeholder="Nota"
          />

          <div className="grid grid-cols-3 gap-3">
            {["Efectivo", "Tarjeta", "Transferencia"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`rounded-2xl px-4 py-3 font-semibold border ${
                  paymentMethod === method
                    ? "bg-dinamita-red border-dinamita-red text-white"
                    : "bg-dinamita-panel2 border-dinamita-line"
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 p-5 flex justify-between text-2xl font-black">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCheckout}
              className="rounded-2xl bg-dinamita-red py-4 text-lg font-black"
            >
              Cobrar
            </button>
            <button
              onClick={handleDirectPrint}
              className={`rounded-2xl border border-dinamita-line py-4 text-lg font-bold ${lastSale ? "" : "opacity-60 cursor-not-allowed"}`}
            >
              Imprimir
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={clearSale} className="rounded-2xl border border-dinamita-line py-3">
              Limpiar venta
            </button>
            <button
              onClick={handleDirectPrint}
              className={`rounded-2xl border border-dinamita-line py-3 ${lastSale ? "" : "opacity-60 cursor-not-allowed"}`}
            >
              Reimprimir
            </button>
          </div>

          {message ? (
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3 text-sm">
              {message}
            </div>
          ) : null}

          {lastSale ? (
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-4 text-sm">
              <p className="font-semibold">Última venta</p>
              <p className="text-dinamita-muted mt-1">Folio: {lastSale.id}</p>
              <p className="text-dinamita-muted">Pago: {lastSale.paymentMethod}</p>
              <p className="text-dinamita-muted">Cliente: {lastSale.customerName}</p>
              <p className="mt-2 font-bold">{money(lastSale.total)}</p>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

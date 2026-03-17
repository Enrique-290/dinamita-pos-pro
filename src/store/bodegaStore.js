import { create } from "zustand";
import { useInventoryStore } from "./inventoryStore";

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  date: today,
  productId: "",
  type: "Entrada",
  qty: "",
  reason: "",
  note: "",
};

export const useBodegaStore = create((set, get) => ({
  moves: [],
  form: emptyForm,
  query: "",
  typeFilter: "Todos",
  message: "",

  setMoves: (moves) => set({ moves: Array.isArray(moves) ? moves : [] }),
  setField: (field, value) => set((state) => ({ form: { ...state.form, [field]: value } })),
  setQuery: (query) => set({ query }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),

  resetForm: () => set({ form: emptyForm, message: "Formulario limpio." }),

  saveMove: () => {
    const state = get();
    const inventory = useInventoryStore.getState();
    const product = inventory.products.find((p) => String(p.id) === String(state.form.productId));

    if (!product) {
      set({ message: "Selecciona un producto válido." });
      return null;
    }

    const qty = Number(state.form.qty || 0);
    if (qty <= 0) {
      set({ message: "La cantidad debe ser mayor a 0." });
      return null;
    }

    const move = {
      id: `BDG-${Date.now()}`,
      date: state.form.date || today,
      productId: product.id,
      productName: product.name,
      type: state.form.type,
      qty,
      reason: state.form.reason || "",
      note: state.form.note || "",
    };

    let nextStock = Number(product.stock || 0);
    if (move.type === "Entrada") nextStock += qty;
    if (move.type === "Salida") nextStock = Math.max(0, nextStock - qty);
    if (move.type === "Ajuste") nextStock = qty;

    useInventoryStore.setState((inv) => ({
      ...inv,
      products: inv.products.map((p) =>
        p.id === product.id ? { ...p, stock: nextStock } : p
      ),
    }));

    set((state) => ({
      moves: [move, ...state.moves],
      form: emptyForm,
      message: `Movimiento registrado para ${product.name}.`,
    }));

    return move;
  },

  getFilteredMoves: () => {
    const { moves, query, typeFilter } = get();
    return moves.filter((move) => {
      const q = String(query || "").toLowerCase();
      const matchesQuery =
        !q ||
        move.productName.toLowerCase().includes(q) ||
        move.reason.toLowerCase().includes(q) ||
        move.note.toLowerCase().includes(q);

      const matchesType = typeFilter === "Todos" || move.type === typeFilter;
      return matchesQuery && matchesType;
    });
  },
}));

import { create } from "zustand";
import { useInventoryStore } from "./inventoryStore";

const today = new Date().toISOString().slice(0, 10);

const emptyWarehouseForm = {
  name: "",
  description: "",
  image: "",
  category: "General",
  barcode: "",
  cost: "",
  price: "",
  qty: "",
  minStock: "",
  expiryDate: "",
  lot: "",
};

const emptyTransferForm = {
  warehouseId: "",
  qty: "",
  reason: "",
};

export const useBodegaStore = create((set, get) => ({
  warehouseItems: [],
  moves: [],
  warehouseForm: emptyWarehouseForm,
  transferForm: emptyTransferForm,
  query: "",
  moveFilter: "Todos",
  message: "",

  setWarehouseItems: (warehouseItems) => set({ warehouseItems: Array.isArray(warehouseItems) ? warehouseItems : [] }),
  setMoves: (moves) => set({ moves: Array.isArray(moves) ? moves : [] }),
  setWarehouseField: (field, value) => set((state) => ({ warehouseForm: { ...state.warehouseForm, [field]: value } })),
  setTransferField: (field, value) => set((state) => ({ transferForm: { ...state.transferForm, [field]: value } })),
  setQuery: (query) => set({ query }),
  setMoveFilter: (moveFilter) => set({ moveFilter }),

  resetWarehouseForm: () => set({ warehouseForm: emptyWarehouseForm }),
  resetTransferForm: () => set({ transferForm: emptyTransferForm }),

  addToWarehouse: () => {
    const state = get();
    const form = state.warehouseForm;
    const qty = Number(form.qty || 0);

    if (!String(form.name || "").trim()) {
      set({ message: "Escribe el nombre del producto para bodega." });
      return null;
    }
    if (qty <= 0) {
      set({ message: "La cantidad inicial en bodega debe ser mayor a 0." });
      return null;
    }

    const item = {
      id: `BDG-P-${Date.now()}`,
      name: String(form.name).trim(),
      description: String(form.description || "").trim(),
      image: String(form.image || "").trim(),
      category: String(form.category || "General").trim(),
      barcode: String(form.barcode || "").trim(),
      cost: Number(form.cost || 0),
      price: Number(form.price || 0),
      qty,
      minStock: Number(form.minStock || 0),
      expiryDate: String(form.expiryDate || ""),
      lot: String(form.lot || "").trim(),
      createdAt: new Date().toISOString(),
    };

    const move = {
      id: `BDG-M-${Date.now()}`,
      date: today,
      type: "Entrada a bodega",
      productName: item.name,
      qty,
      reason: "Alta inicial en bodega",
      note: item.lot || "",
    };

    set((state) => ({
      warehouseItems: [item, ...state.warehouseItems],
      moves: [move, ...state.moves],
      warehouseForm: emptyWarehouseForm,
      message: "Producto resguardado en bodega.",
    }));

    return item;
  },

  transferToInventory: () => {
    const state = get();
    const warehouseId = state.transferForm.warehouseId;
    const qty = Number(state.transferForm.qty || 0);
    const reason = String(state.transferForm.reason || "").trim();

    const item = state.warehouseItems.find((w) => String(w.id) === String(warehouseId));
    if (!item) {
      set({ message: "Selecciona un producto de bodega." });
      return null;
    }
    if (qty <= 0) {
      set({ message: "La cantidad a transferir debe ser mayor a 0." });
      return null;
    }
    if (qty > Number(item.qty || 0)) {
      set({ message: "No hay suficiente stock en bodega para transferir." });
      return null;
    }

    useInventoryStore.getState().receiveFromWarehouse(item, qty);

    const move = {
      id: `BDG-T-${Date.now()}`,
      date: today,
      type: "Traspaso a inventario",
      productName: item.name,
      qty,
      reason: reason || "Surtido manual a inventario",
      note: item.lot || "",
    };

    set((state) => ({
      warehouseItems: state.warehouseItems
        .map((w) =>
          w.id === item.id ? { ...w, qty: Number(w.qty || 0) - qty } : w
        )
        .filter((w) => Number(w.qty || 0) > 0),
      moves: [move, ...state.moves],
      transferForm: emptyTransferForm,
      message: "Producto enviado manualmente a inventario.",
    }));

    return move;
  },

  removeFromWarehouse: (warehouseId, qty, reason = "Salida de bodega") => {
    const state = get();
    const item = state.warehouseItems.find((w) => String(w.id) === String(warehouseId));
    const amount = Number(qty || 0);

    if (!item || amount <= 0 || amount > Number(item.qty || 0)) {
      set({ message: "No se pudo registrar la salida de bodega." });
      return null;
    }

    const move = {
      id: `BDG-S-${Date.now()}`,
      date: today,
      type: "Salida de bodega",
      productName: item.name,
      qty: amount,
      reason,
      note: item.lot || "",
    };

    set((state) => ({
      warehouseItems: state.warehouseItems
        .map((w) =>
          w.id === item.id ? { ...w, qty: Number(w.qty || 0) - amount } : w
        )
        .filter((w) => Number(w.qty || 0) > 0),
      moves: [move, ...state.moves],
      message: "Salida registrada desde bodega.",
    }));

    return move;
  },

  getFilteredWarehouseItems: () => {
    const { warehouseItems, query } = get();
    const q = String(query || "").toLowerCase().trim();
    return warehouseItems.filter((item) => {
      return (
        !q ||
        item.name.toLowerCase().includes(q) ||
        String(item.category || "").toLowerCase().includes(q) ||
        String(item.lot || "").toLowerCase().includes(q) ||
        String(item.barcode || "").toLowerCase().includes(q)
      );
    });
  },

  getFilteredMoves: () => {
    const { moves, query, moveFilter } = get();
    const q = String(query || "").toLowerCase().trim();
    return moves.filter((move) => {
      const matchesQuery =
        !q ||
        move.productName.toLowerCase().includes(q) ||
        String(move.reason || "").toLowerCase().includes(q) ||
        String(move.note || "").toLowerCase().includes(q);

      const matchesType = moveFilter === "Todos" || move.type === moveFilter;
      return matchesQuery && matchesType;
    });
  },
}));

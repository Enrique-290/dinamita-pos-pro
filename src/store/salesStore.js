import { create } from "zustand";
import { useAppDataStore } from "./appDataStore";
import { useInventoryStore } from "./inventoryStore";

const initialState = {
  cart: [],
  paymentMethod: "Efectivo",
  note: "",
  customerName: "Mostrador",
  lastSale: null,
};

export const useSalesStore = create((set, get) => ({
  ...initialState,

  addToCart: (product) =>
    set((state) => {
      const found = state.cart.find((item) => item.id === product.id);
      if (found) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id
              ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.price }
              : item
          ),
        };
      }
      return {
        cart: [
          ...state.cart,
          { id: product.id, name: product.name, price: product.price, qty: 1, total: product.price },
        ],
      };
    }),

  increaseQty: (id) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.price } : item
      ),
    })),

  decreaseQty: (id) =>
    set((state) => ({
      cart: state.cart
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1, total: (item.qty - 1) * item.price } : item
        )
        .filter((item) => item.qty > 0),
    })),

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setNote: (note) => set({ note }),
  setCustomerName: (customerName) => set({ customerName }),

  clearSale: () =>
    set((state) => ({
      cart: [],
      note: "",
      customerName: "Mostrador",
      paymentMethod: "Efectivo",
      lastSale: state.lastSale,
    })),

  checkout: () => {
    const state = get();
    if (!state.cart.length) return null;

    const subtotal = state.cart.reduce((acc, item) => acc + item.total, 0);
    const sale = {
      id: `VTA-${Date.now()}`,
      at: new Date().toISOString(),
      customerName: state.customerName || "Mostrador",
      paymentMethod: state.paymentMethod,
      note: state.note,
      items: state.cart,
      subtotal,
      total: subtotal,
      type: "Venta",
    };

    useAppDataStore.getState().addSale(sale);
    useInventoryStore.getState().applySaleToStock(state.cart);

    set({
      cart: [],
      note: "",
      customerName: "Mostrador",
      paymentMethod: "Efectivo",
      lastSale: sale,
    });

    return sale;
  },
}));

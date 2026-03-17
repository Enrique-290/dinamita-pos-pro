import { create } from "zustand";

export const useAppDataStore = create((set) => ({
  sales: [],
  memberships: [],
  cashEvents: [],
  lastTicket: null,

  addSale: (sale) =>
    set((state) => ({
      sales: [sale, ...state.sales],
      lastTicket: {
        type: "venta",
        folio: sale.id,
        customer: sale.customerName,
        paymentMethod: sale.paymentMethod,
        total: sale.total,
        items: sale.items,
        at: sale.at,
        note: sale.note || "",
      },
      cashEvents: [...state.cashEvents, { kind: "sale", paymentMethod: sale.paymentMethod, total: sale.total, at: sale.at }],
    })),

  addMembership: (membership, withCharge = false) =>
    set((state) => ({
      memberships: [membership, ...state.memberships],
      lastTicket: withCharge
        ? {
            type: "membresia",
            folio: membership.ticketId || membership.id,
            customer: membership.cliente,
            paymentMethod: membership.pago,
            total: membership.monto,
            items: [{ name: membership.tipo, qty: 1, price: membership.monto, total: membership.monto }],
            at: membership.createdAt || new Date().toISOString(),
            note: membership.notes || "",
            membershipType: membership.tipo,
            membershipStart: membership.inicio,
            membershipEnd: membership.fin,
          }
        : state.lastTicket,
      cashEvents: withCharge
        ? [...state.cashEvents, { kind: "membership", paymentMethod: membership.pago, total: membership.monto, at: membership.createdAt || new Date().toISOString() }]
        : state.cashEvents,
    })),

  clearLastTicket: () => set({ lastTicket: null }),
}));

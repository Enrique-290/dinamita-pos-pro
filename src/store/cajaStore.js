import { create } from "zustand";

const openingsSeed = [
  {
    id: "CJ-1001",
    openedAt: "2026-03-15 08:00",
    openedBy: "Admin",
    openingAmount: 500,
    status: "Abierta",
    cashSales: 2150,
    cardSales: 980,
    transferSales: 600,
    cardCommission: 45.08,
    cashExpected: 2650,
    countedCash: 2620,
    difference: -30,
    closedAt: "",
    notes: "Caja de prueba",
  },
];

const initialForm = {
  openedBy: "Admin",
  openingAmount: 0,
  countedCash: 0,
  notes: "",
};

function nowStamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  const hh = `${d.getHours()}`.padStart(2, "0");
  const mi = `${d.getMinutes()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export const useCajaStore = create((set, get) => ({
  sessions: openingsSeed,
  currentSession: openingsSeed[0],
  form: initialForm,
  message: "",

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  openCaja: () => {
    const state = get();
    const amount = Number(state.form.openingAmount || 0);

    const session = {
      id: `CJ-${Date.now()}`,
      openedAt: nowStamp(),
      openedBy: state.form.openedBy || "Admin",
      openingAmount: amount,
      status: "Abierta",
      cashSales: 0,
      cardSales: 0,
      transferSales: 0,
      cardCommission: 0,
      cashExpected: amount,
      countedCash: 0,
      difference: 0,
      closedAt: "",
      notes: state.form.notes || "",
    };

    set((state) => ({
      sessions: [session, ...state.sessions],
      currentSession: session,
      form: { ...state.form, countedCash: 0 },
      message: `Caja abierta con ${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount)}`,
    }));
  },

  closeCaja: () => {
    const state = get();
    if (!state.currentSession) {
      set({ message: "No hay caja activa." });
      return null;
    }

    const countedCash = Number(state.form.countedCash || 0);
    const expected = Number(state.currentSession.cashExpected || 0);
    const difference = countedCash - expected;

    const closed = {
      ...state.currentSession,
      countedCash,
      difference,
      status: "Cerrada",
      closedAt: nowStamp(),
      notes: state.form.notes || state.currentSession.notes,
    };

    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === closed.id ? closed : s)),
      currentSession: closed,
      message:
        difference === 0
          ? "Caja cerrada sin diferencias."
          : `Caja cerrada con diferencia de ${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(difference)}`,
    }));

    return closed;
  },

  simulateMovement: () => {
    const state = get();
    if (!state.currentSession || state.currentSession.status !== "Abierta") {
      set({ message: "Primero abre una caja." });
      return;
    }

    const cashSales = Number(state.currentSession.cashSales || 0) + 250;
    const cardSales = Number(state.currentSession.cardSales || 0) + 180;
    const transferSales = Number(state.currentSession.transferSales || 0) + 120;
    const cardCommission = Number((cardSales * 0.046).toFixed(2));
    const cashExpected = Number(state.currentSession.openingAmount || 0) + cashSales;

    const updated = {
      ...state.currentSession,
      cashSales,
      cardSales,
      transferSales,
      cardCommission,
      cashExpected,
    };

    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === updated.id ? updated : s)),
      currentSession: updated,
      message: "Movimiento de prueba agregado a caja.",
    }));
  },
}));

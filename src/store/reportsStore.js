import { create } from "zustand";

const seedRows = [
  {
    id: "R-1001",
    date: "2024-04-27",
    ticket: "#000112",
    client: "Marcos Jiménez",
    type: "Venta",
    payment: "Efectivo",
    total: 1850,
  },
  {
    id: "R-1002",
    date: "2024-04-27",
    ticket: "#000111",
    client: "Gonzalo Rivera",
    type: "Membresía",
    payment: "Tarjeta",
    total: 900,
  },
  {
    id: "R-1003",
    date: "2024-04-27",
    ticket: "#000110",
    client: "Iván Castellanos",
    type: "Membresía",
    payment: "Transferencia",
    total: 1500,
  },
];

function parseMoneyRows(rows) {
  const summary = {
    gross: 0,
    cash: 0,
    card: 0,
    transfer: 0,
    expenses: 640,
  };

  rows.forEach((row) => {
    const total = Number(row.total || 0);
    summary.gross += total;
    if (row.payment === "Efectivo") summary.cash += total;
    if (row.payment === "Tarjeta") summary.card += total;
    if (row.payment === "Transferencia") summary.transfer += total;
  });

  summary.cardCommission = summary.card * 0.046;
  summary.cardNet = summary.card - summary.cardCommission;
  summary.utility = summary.gross - summary.expenses - summary.cardCommission;

  return summary;
}

export const useReportsStore = create((set, get) => ({
  rows: seedRows,
  filters: {
    query: "",
    payment: "Todos",
    type: "Todos",
  },

  setFilter: (field, value) =>
    set((state) => ({
      filters: { ...state.filters, [field]: value },
    })),

  addReportRow: (row) =>
    set((state) => ({
      rows: [row, ...state.rows],
    })),

  getFilteredRows: () => {
    const { rows, filters } = get();
    return rows.filter((row) => {
      const q = filters.query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        row.client.toLowerCase().includes(q) ||
        row.ticket.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q);

      const matchesPayment =
        filters.payment === "Todos" || row.payment === filters.payment;

      const matchesType = filters.type === "Todos" || row.type === filters.type;

      return matchesQuery && matchesPayment && matchesType;
    });
  },

  getSummary: () => parseMoneyRows(get().getFilteredRows()),
}));

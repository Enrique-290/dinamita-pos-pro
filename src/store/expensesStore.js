import { create } from "zustand";

const seedExpenses = [
  { id: 1, date: "2026-03-15", category: "Proveedor", concept: "Compra de producto", amount: 150, paymentMethod: "Efectivo", note: "" },
  { id: 2, date: "2026-03-15", category: "Servicios", concept: "Internet", amount: 90, paymentMethod: "Transferencia", note: "" },
  { id: 3, date: "2026-03-14", category: "Operación", concept: "Limpieza", amount: 70, paymentMethod: "Efectivo", note: "" },
];

const emptyForm = {
  id: null,
  date: new Date().toISOString().slice(0, 10),
  category: "Proveedor",
  concept: "",
  amount: "",
  paymentMethod: "Efectivo",
  note: "",
};

export const useExpensesStore = create((set, get) => ({
  expenses: seedExpenses,
  form: emptyForm,
  query: "",
  categoryFilter: "Todos",
  paymentFilter: "Todos",
  message: "",

  setExpenses: (expenses) => set({ expenses: Array.isArray(expenses) ? expenses : [] }),
  setField: (field, value) => set((state) => ({ form: { ...state.form, [field]: value } })),
  setQuery: (query) => set({ query }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setPaymentFilter: (paymentFilter) => set({ paymentFilter }),

  editExpense: (expense) => set({
    form: {
      id: expense.id,
      date: expense.date || new Date().toISOString().slice(0, 10),
      category: expense.category || "Proveedor",
      concept: expense.concept || "",
      amount: expense.amount ?? "",
      paymentMethod: expense.paymentMethod || "Efectivo",
      note: expense.note || "",
    },
    message: `Editando gasto: ${expense.concept}`,
  }),

  resetForm: () => set({ form: emptyForm, message: "Formulario limpio." }),

  saveExpense: () => {
    const state = get();
    const form = state.form;
    if (!String(form.concept || "").trim()) {
      set({ message: "Escribe el concepto del gasto." });
      return null;
    }

    const payload = {
      id: form.id ?? Date.now(),
      date: form.date || new Date().toISOString().slice(0, 10),
      category: form.category || "Proveedor",
      concept: String(form.concept).trim(),
      amount: Number(form.amount || 0),
      paymentMethod: form.paymentMethod || "Efectivo",
      note: String(form.note || "").trim(),
    };

    const exists = state.expenses.some((e) => e.id === payload.id);
    const expenses = exists
      ? state.expenses.map((e) => (e.id === payload.id ? payload : e))
      : [payload, ...state.expenses];

    set({
      expenses,
      form: emptyForm,
      message: exists ? "Gasto actualizado." : "Gasto agregado.",
    });

    return payload;
  },

  deleteExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
      message: "Gasto eliminado.",
      form: state.form.id === id ? emptyForm : state.form,
    })),

  getFilteredExpenses: () => {
    const { expenses, query, categoryFilter, paymentFilter } = get();
    return expenses.filter((expense) => {
      const q = String(query || "").toLowerCase();
      const matchesQuery =
        !q ||
        expense.concept.toLowerCase().includes(q) ||
        expense.category.toLowerCase().includes(q) ||
        String(expense.note || "").toLowerCase().includes(q);

      const matchesCategory = categoryFilter === "Todos" || expense.category === categoryFilter;
      const matchesPayment = paymentFilter === "Todos" || expense.paymentMethod === paymentFilter;

      return matchesQuery && matchesCategory && matchesPayment;
    });
  },
}));

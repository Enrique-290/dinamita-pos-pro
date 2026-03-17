import { create } from "zustand";

const seedClients = [
  { id: 1, name: "Gonzalo Rivera", phone: "5512345678", email: "gonzalo@example.com", notes: "Cliente frecuente", active: true },
  { id: 2, name: "Roberto Juárez", phone: "5598765432", email: "roberto@example.com", notes: "", active: true },
  { id: 3, name: "Iván Castellanos", phone: "5581122233", email: "ivan@example.com", notes: "Prefiere transferencia", active: true },
];

const emptyForm = {
  id: null,
  name: "",
  phone: "",
  email: "",
  notes: "",
  active: true,
};

export const useClientsStore = create((set, get) => ({
  clients: seedClients,
  form: emptyForm,
  query: "",
  message: "",

  setClients: (clients) => set({ clients: Array.isArray(clients) ? clients : [] }),
  setField: (field, value) => set((state) => ({ form: { ...state.form, [field]: value } })),
  setQuery: (query) => set({ query }),

  editClient: (client) => set({
    form: {
      id: client.id,
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      notes: client.notes || "",
      active: !!client.active,
    },
    message: `Editando ${client.name}`,
  }),

  resetForm: () => set({ form: emptyForm, message: "Formulario limpio." }),

  saveClient: () => {
    const state = get();
    const form = state.form;
    if (!String(form.name || "").trim()) {
      set({ message: "Escribe el nombre del cliente." });
      return null;
    }

    const payload = {
      id: form.id ?? Date.now(),
      name: String(form.name).trim(),
      phone: String(form.phone || "").trim(),
      email: String(form.email || "").trim(),
      notes: String(form.notes || "").trim(),
      active: !!form.active,
    };

    const exists = state.clients.some((c) => c.id === payload.id);
    const clients = exists
      ? state.clients.map((c) => (c.id === payload.id ? payload : c))
      : [payload, ...state.clients];

    set({
      clients,
      form: emptyForm,
      message: exists ? "Cliente actualizado." : "Cliente agregado.",
    });

    return payload;
  },

  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
      message: "Cliente eliminado.",
      form: state.form.id === id ? emptyForm : state.form,
    })),

  getFilteredClients: () => {
    const { clients, query } = get();
    return clients.filter((client) => {
      const q = String(query || "").toLowerCase();
      return (
        !q ||
        client.name.toLowerCase().includes(q) ||
        String(client.phone || "").toLowerCase().includes(q) ||
        String(client.email || "").toLowerCase().includes(q)
      );
    });
  },
}));

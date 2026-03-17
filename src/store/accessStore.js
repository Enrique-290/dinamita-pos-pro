import { create } from "zustand";
import { useClientsStore } from "./clientsStore";
import { useMembershipsStore } from "./membershipsStore";

const today = new Date().toISOString().slice(0, 10);

function isMembershipActive(clientName, memberships) {
  const clientMemberships = memberships.filter((m) => m.cliente === clientName);
  if (!clientMemberships.length) return { ok: false, reason: "Sin membresía registrada" };

  const latest = clientMemberships
    .slice()
    .sort((a, b) => String(b.fin).localeCompare(String(a.fin)))[0];

  if (latest.estado === "Activa" && String(latest.fin) >= today) {
    return { ok: true, reason: "Acceso permitido", membership: latest };
  }

  return { ok: false, reason: "Membresía vencida", membership: latest };
}

export const useAccessStore = create((set, get) => ({
  logs: [],
  search: "",
  selectedClientName: "",
  message: "",
  accessFilter: "Todos",

  setLogs: (logs) => set({ logs: Array.isArray(logs) ? logs : [] }),
  setSearch: (search) => set({ search }),
  setSelectedClientName: (selectedClientName) => set({ selectedClientName }),
  setAccessFilter: (accessFilter) => set({ accessFilter }),

  validateAndRegisterAccess: () => {
    const state = get();
    const clients = useClientsStore.getState().clients || [];
    const memberships = useMembershipsStore.getState().memberships || [];
    const client = clients.find((c) => c.name === state.selectedClientName);

    if (!client) {
      set({ message: "Selecciona un cliente válido." });
      return null;
    }

    const validation = isMembershipActive(client.name, memberships);
    const now = new Date().toISOString();

    const log = {
      id: `ACC-${Date.now()}`,
      at: now,
      clientName: client.name,
      phone: client.phone || "",
      status: validation.ok ? "Permitido" : "Denegado",
      reason: validation.reason,
      membershipType: validation.membership?.tipo || "-",
      membershipEnd: validation.membership?.fin || "-",
    };

    set((state) => ({
      logs: [log, ...state.logs],
      message: validation.ok
        ? `Acceso permitido para ${client.name}.`
        : `Acceso denegado para ${client.name}: ${validation.reason}.`,
    }));

    return log;
  },

  getFilteredLogs: () => {
    const { logs, search, accessFilter } = get();
    return logs.filter((log) => {
      const q = String(search || "").toLowerCase();
      const matchesSearch =
        !q ||
        log.clientName.toLowerCase().includes(q) ||
        String(log.phone || "").toLowerCase().includes(q) ||
        String(log.reason || "").toLowerCase().includes(q) ||
        String(log.membershipType || "").toLowerCase().includes(q);

      const matchesFilter = accessFilter === "Todos" || log.status === accessFilter;
      return matchesSearch && matchesFilter;
    });
  },
}));

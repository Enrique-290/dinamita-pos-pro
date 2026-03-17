import { create } from "zustand";
import { kvGet, kvSet } from "../lib/localDb";
import { useAppDataStore } from "./appDataStore";
import { useMembershipsStore } from "./membershipsStore";
import { useCajaStore } from "./cajaStore";
import { useInventoryStore } from "./inventoryStore";
import { useClientsStore } from "./clientsStore";
import { useExpensesStore } from "./expensesStore";
import { useConfigStore } from "./configStore";
import { useBodegaStore } from "./bodegaStore";
import { useAccessStore } from "./accessStore";

const defaultMeta = {
  hydrated: false,
  loading: false,
  lastSavedAt: "",
};

export const usePersistenceStore = create((set, get) => ({
  ...defaultMeta,

  hydrateAll: async () => {
    set({ loading: true });
    const [sales, memberships, cashEvents, lastTicket, cajaSessions, cajaCurrent, products, clients, expenses, config, bodegaMoves, accessLogs, membershipPlans] = await Promise.all([
      kvGet("app_sales", []),
      kvGet("app_memberships", []),
      kvGet("app_cash_events", []),
      kvGet("app_last_ticket", null),
      kvGet("caja_sessions", null),
      kvGet("caja_current", null),
      kvGet("inventory_products", null),
      kvGet("clients_rows", null),
      kvGet("expenses_rows", null),
      kvGet("app_config", null),
      kvGet("bodega_moves", null),
      kvGet("access_logs", null),
      kvGet("membership_plans", null),
    ]);

    useAppDataStore.setState({
      sales: Array.isArray(sales) ? sales : [],
      memberships: Array.isArray(memberships) ? memberships : [],
      cashEvents: Array.isArray(cashEvents) ? cashEvents : [],
      lastTicket: lastTicket || null,
    });

    if (Array.isArray(memberships) && memberships.length) {
      useMembershipsStore.setState({ memberships });
    }

    if (Array.isArray(cajaSessions) && cajaSessions.length) {
      useCajaStore.setState({
        sessions: cajaSessions,
        currentSession: cajaCurrent || cajaSessions[0] || null,
      });
    }

    if (Array.isArray(products) && products.length) {
      useInventoryStore.setState({ products });
    }

    if (Array.isArray(clients) && clients.length) {
      useClientsStore.setState({ clients });
    }

    if (Array.isArray(expenses) && expenses.length) {
      useExpensesStore.setState({ expenses });
    }

    if (config) {
      useConfigStore.setState({ config, form: config });
    }

    if (Array.isArray(bodegaMoves) && bodegaMoves.length) {
      useBodegaStore.setState({ moves: bodegaMoves });
    }

    if (Array.isArray(accessLogs) && accessLogs.length) {
      useAccessStore.setState({ logs: accessLogs });
    }

    if (Array.isArray(membershipPlans) && membershipPlans.length) {
      useMembershipsStore.setState({ plans: membershipPlans });
    }

    set({ hydrated: true, loading: false });
  },

  saveAll: async () => {
    const app = useAppDataStore.getState();
    const membershipsState = useMembershipsStore.getState();
    const caja = useCajaStore.getState();
    const inventory = useInventoryStore.getState();
    const clientsStore = useClientsStore.getState();
    const expensesStore = useExpensesStore.getState();
    const configStore = useConfigStore.getState();
    const bodegaStore = useBodegaStore.getState();
    const accessStore = useAccessStore.getState();
    const membershipsStore = useMembershipsStore.getState();

    await Promise.all([
      kvSet("app_sales", app.sales),
      kvSet("app_memberships", app.memberships),
      kvSet("app_cash_events", app.cashEvents),
      kvSet("app_last_ticket", app.lastTicket),
      kvSet("memberships_rows", membershipsState.memberships),
      kvSet("caja_sessions", caja.sessions),
      kvSet("caja_current", caja.currentSession),
      kvSet("inventory_products", inventory.products),
      kvSet("clients_rows", clientsStore.clients),
      kvSet("expenses_rows", expensesStore.expenses),
      kvSet("app_config", configStore.config),
      kvSet("bodega_moves", bodegaStore.moves),
      kvSet("access_logs", accessStore.logs),
      kvSet("membership_plans", membershipsStore.plans),
    ]);

    set({ lastSavedAt: new Date().toISOString() });
  },
}));

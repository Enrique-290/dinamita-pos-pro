import { kvGet, kvSet } from "./localDb";
import { useAppDataStore } from "../store/appDataStore";
import { useMembershipsStore } from "../store/membershipsStore";
import { useCajaStore } from "../store/cajaStore";
import { useInventoryStore } from "../store/inventoryStore";
import { useClientsStore } from "../store/clientsStore";
import { useExpensesStore } from "../store/expensesStore";

const BACKUP_KEYS = [
  "app_sales",
  "app_memberships",
  "app_cash_events",
  "app_last_ticket",
  "caja_sessions",
  "caja_current",
  "inventory_products",
  "clients_rows",
  "expenses_rows",
];

export async function buildBackupPayload() {
  const payload = {
    appName: "Dinamita POS Pro",
    version: "v14",
    exportedAt: new Date().toISOString(),
    data: {},
  };

  for (const key of BACKUP_KEYS) {
    payload.data[key] = await kvGet(key, null);
  }

  return payload;
}

export async function downloadBackupJson() {
  const payload = await buildBackupPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  a.href = url;
  a.download = `dinamita-pos-pro-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return payload;
}

export async function restoreBackupPayload(payload) {
  const data = payload?.data || {};

  for (const key of BACKUP_KEYS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      await kvSet(key, data[key]);
    }
  }

  if (Array.isArray(data.app_sales)) {
    useAppDataStore.setState((state) => ({ ...state, sales: data.app_sales || [] }));
  }

  useAppDataStore.setState((state) => ({
    ...state,
    memberships: Array.isArray(data.app_memberships) ? data.app_memberships : [],
    cashEvents: Array.isArray(data.app_cash_events) ? data.app_cash_events : [],
    lastTicket: data.app_last_ticket || null,
  }));

  if (Array.isArray(data.app_memberships)) {
    useMembershipsStore.setState((state) => ({ ...state, memberships: data.app_memberships }));
  }

  if (Array.isArray(data.caja_sessions)) {
    useCajaStore.setState((state) => ({
      ...state,
      sessions: data.caja_sessions,
      currentSession: data.caja_current || data.caja_sessions[0] || null,
    }));
  }

  if (Array.isArray(data.inventory_products)) {
    useInventoryStore.setState((state) => ({ ...state, products: data.inventory_products }));
  }

  if (Array.isArray(data.clients_rows)) {
    useClientsStore.setState((state) => ({ ...state, clients: data.clients_rows }));
  }

  if (Array.isArray(data.expenses_rows)) {
    useExpensesStore.setState((state) => ({ ...state, expenses: data.expenses_rows }));
  }

  return true;
}

export async function restoreBackupFile(file) {
  const text = await file.text();
  const payload = JSON.parse(text);
  await restoreBackupPayload(payload);
  return payload;
}

import { create } from "zustand";
import { useAppDataStore } from "./appDataStore";

const defaultPlans = [
  { id: "M1", name: "Mensualidad", days: 30, price: 450, active: true },
  { id: "M2", name: "Semana", days: 7, price: 150, active: true },
  { id: "M3", name: "Visita", days: 1, price: 50, active: true },
  { id: "M4", name: "3 Meses Promo", days: 90, price: 900, active: true },
];

function formatYMD(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + Number(days || 0));
  return formatYMD(d);
}

const today = formatYMD(new Date());

const seedRows = [
  {
    id: "MB-1001",
    cliente: "Gonzalo Rivera",
    planId: "M4",
    tipo: "3 Meses Promo",
    days: 90,
    inicio: "2024-04-09",
    fin: "2024-07-08",
    estado: "Activa",
    pago: "Efectivo",
    monto: 900,
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "MB-1002",
    cliente: "Roberto Juárez",
    planId: "M1",
    tipo: "Mensualidad",
    days: 30,
    inicio: "2024-04-27",
    fin: "2024-05-27",
    estado: "Activa",
    pago: "Tarjeta",
    monto: 450,
    notes: "",
    createdAt: new Date().toISOString(),
  },
];

const initialForm = {
  cliente: "",
  planId: "M1",
  inicio: today,
  fin: addDays(today, 30),
  monto: 450,
  pago: "Efectivo",
  notes: "",
};

const initialPlanForm = {
  id: null,
  name: "",
  days: "",
  price: "",
  active: true,
};

function calcStatus(endDate) {
  const now = new Date();
  const end = new Date(endDate + "T23:59:59");
  return end >= now ? "Activa" : "Vencida";
}

export const useMembershipsStore = create((set, get) => ({
  plans: defaultPlans,
  memberships: seedRows,
  form: initialForm,
  planForm: initialPlanForm,
  plansQuery: "",
  lastSaved: null,
  infoMessage: "",
  isPlanManagerOpen: false,

  setMemberships: (memberships) => set({ memberships: Array.isArray(memberships) ? memberships : [] }),
  setPlans: (plans) => set({ plans: Array.isArray(plans) ? plans : defaultPlans }),
  setField: (field, value) =>
    set((state) => {
      const nextForm = { ...state.form, [field]: value };

      if (field === "planId") {
        const plan = state.plans.find((p) => p.id === value);
        if (plan) {
          nextForm.monto = plan.price;
          nextForm.fin = addDays(nextForm.inicio, plan.days);
        }
      }

      if (field === "inicio") {
        const plan = state.plans.find((p) => p.id === nextForm.planId);
        if (plan) nextForm.fin = addDays(value, plan.days);
      }

      return { form: nextForm };
    }),

  resetForm: () =>
    set({
      form: {
        ...initialForm,
        inicio: today,
        fin: addDays(today, 30),
      },
      infoMessage: "Formulario limpiado.",
    }),

  openPlanManager: () => set({ isPlanManagerOpen: true }),
  closePlanManager: () => set({ isPlanManagerOpen: false, planForm: initialPlanForm }),
  setPlansQuery: (plansQuery) => set({ plansQuery }),
  setPlanField: (field, value) => set((state) => ({ planForm: { ...state.planForm, [field]: value } })),
  resetPlanForm: () => set({ planForm: initialPlanForm }),

  editPlan: (plan) =>
    set({
      planForm: {
        id: plan.id,
        name: plan.name || "",
        days: plan.days ?? "",
        price: plan.price ?? "",
        active: plan.active !== false,
      },
      isPlanManagerOpen: true,
    }),

  savePlan: () => {
    const state = get();
    const form = state.planForm;
    if (!String(form.name || "").trim()) {
      set({ infoMessage: "Escribe el nombre de la membresía." });
      return null;
    }

    const payload = {
      id: form.id || `M-${Date.now()}`,
      name: String(form.name).trim(),
      days: Number(form.days || 0),
      price: Number(form.price || 0),
      active: !!form.active,
    };

    const exists = state.plans.some((p) => p.id === payload.id);
    const plans = exists
      ? state.plans.map((p) => (p.id === payload.id ? payload : p))
      : [payload, ...state.plans];

    set({
      plans,
      planForm: initialPlanForm,
      infoMessage: exists ? "Membresía actualizada." : "Membresía agregada.",
      isPlanManagerOpen: true,
    });

    return payload;
  },

  deletePlan: (id) =>
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
      infoMessage: "Membresía eliminada.",
      planForm: state.planForm.id === id ? initialPlanForm : state.planForm,
    })),

  getFilteredPlans: () => {
    const { plans, plansQuery } = get();
    const q = String(plansQuery || "").toLowerCase();
    return plans.filter((plan) => {
      return (
        !q ||
        plan.name.toLowerCase().includes(q) ||
        String(plan.days).includes(q) ||
        String(plan.price).includes(q)
      );
    });
  },

  saveMembership: (withCharge = false) => {
    const state = get();
    const plan = state.plans.find((p) => p.id === state.form.planId);
    if (!state.form.cliente.trim()) {
      set({ infoMessage: "Selecciona o escribe el nombre del cliente." });
      return null;
    }
    if (!plan) {
      set({ infoMessage: "Selecciona un plan válido." });
      return null;
    }

    const createdAt = new Date().toISOString();
    const row = {
      id: `MB-${Date.now()}`,
      cliente: state.form.cliente.trim(),
      planId: plan.id,
      tipo: plan.name,
      days: plan.days,
      inicio: state.form.inicio,
      fin: addDays(state.form.inicio, plan.days),
      estado: calcStatus(addDays(state.form.inicio, plan.days)),
      pago: state.form.pago,
      monto: Number(state.form.monto || 0),
      notes: state.form.notes,
      ticketId: withCharge ? `T-${Date.now()}` : "",
      createdAt,
    };

    useAppDataStore.getState().addMembership(row, withCharge);

    set({
      memberships: [row, ...state.memberships],
      lastSaved: row,
      form: {
        ...initialForm,
        inicio: today,
        fin: addDays(today, 30),
      },
      infoMessage: withCharge
        ? `Membresía guardada y cobrada: ${row.ticketId}`
        : "Membresía guardada sin cobro.",
    });

    return row;
  },
}));

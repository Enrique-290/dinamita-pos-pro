import { create } from "zustand";

const defaultConfig = {
  businessName: "DINÁMITA GYM",
  appName: "Dinamita POS Pro",
  ownerName: "Admin",
  ticketMessage: "Gracias por tu compra en Dinamita Gym 💥",
  accent: "red",
  currency: "MXN",
};

export const useConfigStore = create((set) => ({
  config: defaultConfig,
  form: defaultConfig,
  message: "",

  setConfig: (config) => set({ config: config || defaultConfig, form: config || defaultConfig }),
  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  resetForm: () =>
    set((state) => ({
      form: state.config,
      message: "Configuración restablecida al último guardado.",
    })),

  saveConfig: () =>
    set((state) => ({
      config: state.form,
      message: "Configuración guardada.",
    })),
}));

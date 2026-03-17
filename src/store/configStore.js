import { create } from "zustand";

const defaultTheme = {
  menuBg: "#0d0f18",
  appBg: "#090a0f",
  panelBg: "#121521",
  panelBg2: "#171b2a",
  borderColor: "#2a3040",
  accentColor: "#cf1124",
  buttonBg: "#cf1124",
  buttonText: "#ffffff",
  textColor: "#f5f7fb",
  mutedColor: "#9aa4b2",
};

const defaultBusiness = {
  businessName: "DINÁMITA GYM",
  appName: "Dinamita POS Pro",
  ownerName: "Admin",
  ticketMessage: "Gracias por tu compra en Dinamita Gym 💥",
  currency: "MXN",
  address: "",
  phone: "",
  email: "",
  instagram: "",
  facebook: "",
  whatsapp: "",
};

const defaultConfig = {
  ...defaultBusiness,
  theme: defaultTheme,
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
  setThemeField: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        theme: {
          ...state.form.theme,
          [field]: value,
        },
      },
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

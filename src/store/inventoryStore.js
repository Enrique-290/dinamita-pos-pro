import { create } from "zustand";

const seedProducts = [
  {
    id: 1,
    name: "Proteína Whey",
    description: "Proteína de suero para recuperación muscular.",
    image: "https://via.placeholder.com/300x220?text=Proteina+Whey",
    price: 500,
    cost: 320,
    stock: 20,
    category: "Suplementos",
    barcode: "75010001",
    active: true,
  },
  {
    id: 2,
    name: "Creatina Hardcore",
    description: "Creatina para fuerza y potencia.",
    image: "https://via.placeholder.com/300x220?text=Creatina",
    price: 850,
    cost: 610,
    stock: 12,
    category: "Suplementos",
    barcode: "75010002",
    active: true,
  },
  {
    id: 3,
    name: "Agua Natural",
    description: "Botella de agua natural 1 litro.",
    image: "https://via.placeholder.com/300x220?text=Agua+Natural",
    price: 15,
    cost: 8,
    stock: 30,
    category: "Bebidas",
    barcode: "75010003",
    active: true,
  },
  {
    id: 4,
    name: "Gatorade Naranja",
    description: "Bebida isotónica sabor naranja.",
    image: "https://via.placeholder.com/300x220?text=Gatorade",
    price: 30,
    cost: 18,
    stock: 25,
    category: "Bebidas",
    barcode: "75010004",
    active: true,
  },
  {
    id: 5,
    name: "Guantes Pro",
    description: "Guantes para entrenamiento y agarre.",
    image: "https://via.placeholder.com/300x220?text=Guantes",
    price: 290,
    cost: 180,
    stock: 10,
    category: "Accesorios",
    barcode: "75010005",
    active: true,
  },
  {
    id: 6,
    name: "Shaker Rojo",
    description: "Shaker con tapa de rosca.",
    image: "https://via.placeholder.com/300x220?text=Shaker",
    price: 180,
    cost: 95,
    stock: 14,
    category: "Accesorios",
    barcode: "75010006",
    active: true,
  },
];

const emptyForm = {
  id: null,
  name: "",
  description: "",
  image: "",
  category: "Suplementos",
  barcode: "",
  cost: "",
  price: "",
  stock: "",
  active: true,
};

export const useInventoryStore = create((set, get) => ({
  products: seedProducts,
  form: emptyForm,
  query: "",
  categoryFilter: "Todos",
  message: "",

  setProducts: (products) => set({ products: Array.isArray(products) ? products : [] }),
  setField: (field, value) => set((state) => ({ form: { ...state.form, [field]: value } })),
  setQuery: (query) => set({ query }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),

  editProduct: (product) => set({
    form: {
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      image: product.image || "",
      category: product.category || "Suplementos",
      barcode: product.barcode || "",
      cost: product.cost ?? "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      active: !!product.active,
    },
    message: `Editando ${product.name}`,
  }),

  resetForm: () => set({ form: emptyForm, message: "Formulario limpio." }),

  saveProduct: () => {
    const state = get();
    const form = state.form;
    if (!String(form.name || "").trim()) {
      set({ message: "Escribe el nombre del producto." });
      return null;
    }

    const payload = {
      id: form.id ?? Date.now(),
      name: String(form.name).trim(),
      description: String(form.description || "").trim(),
      image: String(form.image || "").trim(),
      category: form.category || "Suplementos",
      barcode: String(form.barcode || "").trim(),
      cost: Number(form.cost || 0),
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      active: !!form.active,
    };

    const exists = state.products.some((p) => p.id === payload.id);
    const products = exists
      ? state.products.map((p) => (p.id === payload.id ? payload : p))
      : [payload, ...state.products];

    set({
      products,
      form: emptyForm,
      message: exists ? "Producto actualizado." : "Producto agregado.",
    });

    return payload;
  },

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      message: "Producto eliminado.",
      form: state.form.id === id ? emptyForm : state.form,
    })),

  applySaleToStock: (items = []) =>
    set((state) => ({
      products: state.products.map((product) => {
        const sold = items.find((i) => i.id === product.id);
        if (!sold) return product;
        return { ...product, stock: Math.max(0, Number(product.stock || 0) - Number(sold.qty || 0)) };
      }),
    })),

  getFilteredProducts: () => {
    const { products, query, categoryFilter } = get();
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        String(product.barcode || "").toLowerCase().includes(query.toLowerCase()) ||
        String(product.description || "").toLowerCase().includes(query.toLowerCase());

      const matchesCategory = categoryFilter === "Todos" || product.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  },
}));

import { create } from "zustand";

const seedCategories = ["Suplementos", "Bebidas", "Accesorios"];

const seedProducts = [
  {
    id: 1,
    name: "Proteína Whey",
    description: "Proteína de suero para recuperación muscular.",
    image: "https://via.placeholder.com/300x220?text=Proteina+Whey",
    price: 500,
    cost: 320,
    stock: 20,
    minStock: 5,
    expiryDate: "",
    lot: "LOTE-001",
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
    minStock: 4,
    expiryDate: "",
    lot: "LOTE-002",
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
    minStock: 10,
    expiryDate: "",
    lot: "LOTE-003",
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
    minStock: 8,
    expiryDate: "",
    lot: "LOTE-004",
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
    minStock: 3,
    expiryDate: "",
    lot: "LOTE-005",
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
    minStock: 4,
    expiryDate: "",
    lot: "LOTE-006",
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
  minStock: "",
  expiryDate: "",
  lot: "",
  active: true,
};

const emptyCategoryForm = {
  index: null,
  name: "",
};

export const useInventoryStore = create((set, get) => ({
  products: seedProducts,
  categories: seedCategories,
  form: emptyForm,
  categoryForm: emptyCategoryForm,
  query: "",
  categoryFilter: "Todos",
  stockAddQty: "",
  stockAddProductId: null,
  message: "",
  isCategoryManagerOpen: false,

  setProducts: (products) => set({ products: Array.isArray(products) ? products : [] }),
  setCategories: (categories) => set({ categories: Array.isArray(categories) && categories.length ? categories : seedCategories }),
  setField: (field, value) => set((state) => ({ form: { ...state.form, [field]: value } })),
  setQuery: (query) => set({ query }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setStockAddQty: (stockAddQty) => set({ stockAddQty }),
  setStockAddProductId: (stockAddProductId) => set({ stockAddProductId }),

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
      minStock: product.minStock ?? "",
      expiryDate: product.expiryDate || "",
      lot: product.lot || "",
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
      minStock: Number(form.minStock || 0),
      expiryDate: String(form.expiryDate || ""),
      lot: String(form.lot || "").trim(),
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
  receiveFromWarehouse: (warehouseItem, qty) =>
    set((state) => {
      const amount = Number(qty || 0);
      if (!warehouseItem || amount <= 0) return state;

      const existing = state.products.find((p) => String(p.name).toLowerCase() === String(warehouseItem.name).toLowerCase());

      if (existing) {
        return {
          products: state.products.map((p) =>
            p.id === existing.id ? { ...p, stock: Number(p.stock || 0) + amount } : p
          ),
        };
      }

      const payload = {
        id: Date.now(),
        name: warehouseItem.name,
        description: warehouseItem.description || "",
        image: warehouseItem.image || "",
        category: warehouseItem.category || (state.categories[0] || "General"),
        barcode: warehouseItem.barcode || "",
        cost: Number(warehouseItem.cost || 0),
        price: Number(warehouseItem.price || 0),
        stock: amount,
        minStock: Number(warehouseItem.minStock || 0),
        expiryDate: warehouseItem.expiryDate || "",
        lot: warehouseItem.lot || "",
        active: true,
      };

      return {
        products: [payload, ...state.products],
      };
    }),


  addStockToProduct: () => {
    const state = get();
    const qty = Number(state.stockAddQty || 0);
    if (!state.stockAddProductId) {
      set({ message: "Selecciona un producto para agregar stock." });
      return null;
    }
    if (qty <= 0) {
      set({ message: "La cantidad debe ser mayor a 0." });
      return null;
    }

    const products = state.products.map((product) =>
      product.id === state.stockAddProductId
        ? { ...product, stock: Number(product.stock || 0) + qty }
        : product
    );

    set({
      products,
      stockAddQty: "",
      stockAddProductId: null,
      message: "Stock agregado correctamente.",
    });
    return true;
  },

  openCategoryManager: () => set({ isCategoryManagerOpen: true }),
  closeCategoryManager: () => set({ isCategoryManagerOpen: false, categoryForm: emptyCategoryForm }),
  setCategoryFormField: (field, value) =>
    set((state) => ({ categoryForm: { ...state.categoryForm, [field]: value } })),
  editCategory: (index, name) => set({ categoryForm: { index, name }, isCategoryManagerOpen: true }),
  resetCategoryForm: () => set({ categoryForm: emptyCategoryForm }),

  saveCategory: () => {
    const state = get();
    const name = String(state.categoryForm.name || "").trim();
    if (!name) {
      set({ message: "Escribe el nombre de la categoría." });
      return null;
    }

    let categories = [...state.categories];
    const existsName = categories.some((c, idx) => c.toLowerCase() === name.toLowerCase() && idx !== state.categoryForm.index);
    if (existsName) {
      set({ message: "Esa categoría ya existe." });
      return null;
    }

    if (state.categoryForm.index === null || state.categoryForm.index === undefined) {
      categories.push(name);
      set({ categories, categoryForm: emptyCategoryForm, isCategoryManagerOpen: true, message: "Categoría agregada." });
    } else {
      const previous = categories[state.categoryForm.index];
      categories[state.categoryForm.index] = name;
      const products = state.products.map((p) => (p.category === previous ? { ...p, category: name } : p));
      set({
        categories,
        products,
        categoryForm: emptyCategoryForm,
        isCategoryManagerOpen: true,
        message: "Categoría actualizada.",
      });
    }
    return true;
  },

  deleteCategory: (index) =>
    set((state) => {
      const categoryName = state.categories[index];
      const categories = state.categories.filter((_, idx) => idx !== index);
      const fallback = categories[0] || "General";
      const products = state.products.map((p) =>
        p.category === categoryName ? { ...p, category: fallback } : p
      );
      return {
        categories: categories.length ? categories : [fallback],
        products,
        message: "Categoría eliminada.",
        categoryForm: emptyCategoryForm,
      };
    }),

  getFilteredProducts: () => {
    const { products, query, categoryFilter } = get();
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        String(product.barcode || "").toLowerCase().includes(query.toLowerCase()) ||
        String(product.description || "").toLowerCase().includes(query.toLowerCase()) ||
        String(product.lot || "").toLowerCase().includes(query.toLowerCase());

      const matchesCategory = categoryFilter === "Todos" || product.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  },
}));

import { useRef } from "react";
import { useClientsStore } from "../../store/clientsStore";

const placeholderPhoto = "https://via.placeholder.com/96x96?text=Cliente";

export default function Clientes() {
  const {
    form,
    query,
    message,
    setField,
    setQuery,
    generatePreviewCode,
    editClient,
    resetForm,
    saveClient,
    deleteClient,
    getFilteredClients,
  } = useClientsStore();

  const rows = getFilteredClients();
  const fileRef = useRef(null);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setField("photo", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const previewCode = form.clientCode || (form.name ? generatePreviewCode(form.name) : "");

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[.95fr_1.2fr] gap-6">
      <section className="soft-panel p-6">
        <h3 className="text-3xl font-black mb-5">Clientes</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-4 items-center">
            <div className="h-24 w-24 rounded-2xl overflow-hidden border border-dinamita-line bg-dinamita-panel2">
              <img
                src={form.photo || placeholderPhoto}
                alt="cliente"
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.src = placeholderPhoto; }}
              />
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3">
                <p className="text-xs text-dinamita-muted">ID único sugerido</p>
                <p className="font-bold">{previewCode || "Se genera al escribir nombre"}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => fileRef.current?.click()} className="rounded-2xl border border-dinamita-line px-5 py-3">
                  Subir fotografía
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <input
                  value={form.photo}
                  onChange={(e) => setField("photo", e.target.value)}
                  className="input-pro"
                  placeholder="o pega URL de foto"
                />
              </div>
            </div>
          </div>

          <input
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="input-pro"
            placeholder="Nombre del cliente"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className="input-pro"
              placeholder="Teléfono"
            />
            <input
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className="input-pro"
              placeholder="Correo"
            />
          </div>

          <input
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            className="input-pro"
            placeholder="Notas"
          />

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={!!form.active}
              onChange={(e) => setField("active", e.target.checked)}
            />
            Cliente activo
          </label>

          <div className="flex flex-wrap gap-3">
            <button onClick={resetForm} className="rounded-2xl border border-dinamita-line px-5 py-3">
              Limpiar
            </button>
            <button onClick={saveClient} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
              Guardar cliente
            </button>
          </div>

          {message ? (
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3 text-sm">
              {message}
            </div>
          ) : null}
        </div>
      </section>

      <section className="soft-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h3 className="text-2xl font-bold">Listado de clientes</h3>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-pro md:max-w-sm"
            placeholder="Buscar nombre, id, teléfono o correo..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-dinamita-muted">
              <tr>
                <th className="pb-3">Foto</th>
                <th className="pb-3">ID</th>
                <th className="pb-3">Nombre</th>
                <th className="pb-3">Teléfono</th>
                <th className="pb-3">Correo</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3">Notas</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-dinamita-line">
                  <td className="py-3">
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-dinamita-line bg-dinamita-panel2">
                      <img
                        src={row.photo || placeholderPhoto}
                        alt={row.name}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.src = placeholderPhoto; }}
                      />
                    </div>
                  </td>
                  <td className="py-3 font-semibold">{row.clientCode || "-"}</td>
                  <td className="py-3 font-medium">{row.name}</td>
                  <td className="py-3">{row.phone || "-"}</td>
                  <td className="py-3">{row.email || "-"}</td>
                  <td className="py-3">{row.active ? "Activo" : "Inactivo"}</td>
                  <td className="py-3">{row.notes || "-"}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => editClient(row)} className="rounded-xl border border-dinamita-line px-3 py-1">
                        Editar
                      </button>
                      <button onClick={() => deleteClient(row.id)} className="rounded-xl border border-dinamita-line px-3 py-1">
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

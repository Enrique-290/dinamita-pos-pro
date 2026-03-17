import { useClientsStore } from "../../store/clientsStore";

export default function Clientes() {
  const {
    form,
    query,
    message,
    setField,
    setQuery,
    editClient,
    resetForm,
    saveClient,
    deleteClient,
    getFilteredClients,
  } = useClientsStore();

  const rows = getFilteredClients();

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[.9fr_1.2fr] gap-6">
      <section className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-6 shadow-soft">
        <h3 className="text-3xl font-black mb-5">Clientes</h3>

        <div className="space-y-4">
          <input
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="w-full rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
            placeholder="Nombre del cliente"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
              placeholder="Teléfono"
            />
            <input
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
              placeholder="Correo"
            />
          </div>

          <input
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            className="w-full rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
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

      <section className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-6 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h3 className="text-2xl font-bold">Listado de clientes</h3>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:max-w-sm rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3"
            placeholder="Buscar nombre, teléfono o correo..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-dinamita-muted">
              <tr>
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

import { useClientsStore } from "../../store/clientsStore";
import { useAccessStore } from "../../store/accessStore";

const filters = ["Todos", "Permitido", "Denegado"];

export default function Acceso() {
  const clients = useClientsStore((s) => s.clients).filter((c) => c.active !== false);
  const {
    search,
    selectedClientName,
    message,
    accessFilter,
    setSearch,
    setSelectedClientName,
    setAccessFilter,
    validateAndRegisterAccess,
    getFilteredLogs,
  } = useAccessStore();

  const rows = getFilteredLogs();

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[.95fr_1.15fr] gap-6">
      <section className="soft-panel p-6">
        <h3 className="text-3xl font-black mb-5">Control de acceso</h3>

        <div className="space-y-4">
          <select
            value={selectedClientName}
            onChange={(e) => setSelectedClientName(e.target.value)}
            className="input-pro"
          >
            <option value="">Selecciona cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.name}>
                {client.name}
              </option>
            ))}
          </select>

          <button
            onClick={validateAndRegisterAccess}
            className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold"
          >
            Validar acceso
          </button>

          {message ? (
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3 text-sm">
              {message}
            </div>
          ) : null}

          <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 p-5 text-sm">
            <p className="font-semibold mb-2">Flujo básico incluido</p>
            <p className="text-dinamita-muted">• Selección de cliente</p>
            <p className="text-dinamita-muted">• Validación por membresía activa</p>
            <p className="text-dinamita-muted">• Registro de acceso permitido / denegado</p>
            <p className="text-dinamita-muted">• Historial local</p>
          </div>
        </div>
      </section>

      <section className="soft-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h3 className="text-2xl font-bold">Historial de accesos</h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-pro md:max-w-sm"
            placeholder="Buscar cliente o motivo..."
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          {filters.map((tab) => (
            <button
              key={tab}
              onClick={() => setAccessFilter(tab)}
              className={`rounded-2xl border px-4 py-2 ${
                accessFilter === tab
                  ? "bg-dinamita-red border-dinamita-red text-white"
                  : "border-dinamita-line bg-dinamita-panel2"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-dinamita-muted">
              <tr>
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3">Motivo</th>
                <th className="pb-3">Membresía</th>
                <th className="pb-3">Vence</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-dinamita-line">
                  <td className="py-3">{String(row.at).replace("T", " ").slice(0, 16)}</td>
                  <td className="py-3 font-medium">{row.clientName}</td>
                  <td className="py-3">{row.status}</td>
                  <td className="py-3">{row.reason}</td>
                  <td className="py-3">{row.membershipType}</td>
                  <td className="py-3">{row.membershipEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!rows.length ? (
          <div className="mt-4 rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-4 text-dinamita-muted">
            Aún no hay accesos registrados.
          </div>
        ) : null}
      </section>
    </div>
  );
}

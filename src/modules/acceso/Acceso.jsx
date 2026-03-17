import { useMemo } from "react";
import { useClientsStore } from "../../store/clientsStore";
import { useAccessStore } from "../../store/accessStore";

const filters = ["Todos", "Permitido", "Denegado"];
const placeholderPhoto = "https://via.placeholder.com/64x64?text=Cliente";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

export default function Acceso() {
  const clients = useClientsStore((s) => s.clients).filter((c) => c.active !== false);
  const {
    logs,
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

  const suggestions = useMemo(() => {
    const q = normalize(search);
    if (!q) return clients.slice(0, 8);

    return clients.filter((client) => {
      const full = normalize(client.name);
      const code = normalize(client.clientCode);
      const phone = normalize(client.phone);
      const email = normalize(client.email);
      return (
        full.includes(q) ||
        code.includes(q) ||
        phone.includes(q) ||
        email.includes(q)
      );
    }).slice(0, 10);
  }, [clients, search]);

  const rows = getFilteredLogs();

  const handleSelectClient = (client) => {
    setSelectedClientName(client.name);
    setSearch(client.clientCode || client.name);
  };

  const handleValidate = () => {
    validateAndRegisterAccess();
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[.95fr_1.15fr] gap-6">
      <section className="soft-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="text-3xl font-black">Control de acceso</h3>
          <span className="badge-chip">Listo para lector por ID</span>
        </div>

        <div className="space-y-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-pro"
            placeholder="Buscar por nombre, id único o lector de código..."
            autoComplete="off"
          />

          <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 p-3 max-h-[320px] overflow-auto">
            {suggestions.length ? (
              <div className="space-y-2">
                {suggestions.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className={`w-full text-left rounded-2xl border px-3 py-3 transition ${
                      selectedClientName === client.name
                        ? "border-dinamita-red bg-dinamita-red/10"
                        : "border-dinamita-line bg-transparent hover:bg-dinamita-panel"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-14 w-14 rounded-xl overflow-hidden border border-dinamita-line bg-dinamita-panel shrink-0">
                        <img
                          src={client.photo || placeholderPhoto}
                          alt={client.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.src = placeholderPhoto; }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{client.name}</p>
                        <p className="text-xs text-dinamita-muted truncate">
                          ID: {client.clientCode || "-"} {client.phone ? `· ${client.phone}` : ""}
                        </p>
                        <p className="text-xs text-dinamita-muted truncate">
                          {client.email || "Sin correo"}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <span className="rounded-full border border-dinamita-line px-3 py-1 text-xs">
                          Seleccionar
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel px-4 py-4 text-dinamita-muted text-sm">
                No hay coincidencias. Prueba con nombre, id único o datos parciales.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 p-5 text-sm">
            <p className="font-semibold mb-2">Cliente seleccionado</p>
            <p className="text-dinamita-muted">
              {selectedClientName ? selectedClientName : "Aún no seleccionas un cliente"}
            </p>
          </div>

          <button
            onClick={handleValidate}
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
            <p className="font-semibold mb-2">Flujo mejorado</p>
            <p className="text-dinamita-muted">• Busca con pocas letras</p>
            <p className="text-dinamita-muted">• Busca por id único del cliente</p>
            <p className="text-dinamita-muted">• Compatible con captura rápida para lector USB HID</p>
            <p className="text-dinamita-muted">• Selecciona cliente y valida membresía</p>
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
            placeholder="Buscar cliente, id o motivo..."
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
                  <td className="py-3">
                    <p className="font-medium">{row.clientName}</p>
                    <p className="text-xs text-dinamita-muted">{row.phone || "-"}</p>
                  </td>
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

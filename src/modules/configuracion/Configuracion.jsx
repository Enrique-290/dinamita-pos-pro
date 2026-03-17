import { useConfigStore } from "../../store/configStore";

const accents = [
  { key: "red", label: "Rojo Dinamita" },
  { key: "blue", label: "Azul" },
  { key: "green", label: "Verde" },
  { key: "purple", label: "Morado" },
];

export default function Configuracion() {
  const { form, message, setField, resetForm, saveConfig } = useConfigStore();

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[.95fr_1.15fr] gap-6">
      <section className="soft-panel p-6">
        <h3 className="text-3xl font-black mb-5">Configuración y branding</h3>

        <div className="space-y-4">
          <input
            value={form.businessName}
            onChange={(e) => setField("businessName", e.target.value)}
            className="input-pro"
            placeholder="Nombre del negocio"
          />
          <input
            value={form.appName}
            onChange={(e) => setField("appName", e.target.value)}
            className="input-pro"
            placeholder="Nombre de la app"
          />
          <input
            value={form.ownerName}
            onChange={(e) => setField("ownerName", e.target.value)}
            className="input-pro"
            placeholder="Nombre del administrador"
          />
          <input
            value={form.ticketMessage}
            onChange={(e) => setField("ticketMessage", e.target.value)}
            className="input-pro"
            placeholder="Mensaje del ticket"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.accent}
              onChange={(e) => setField("accent", e.target.value)}
              className="input-pro"
            >
              {accents.map((a) => (
                <option key={a.key} value={a.key}>{a.label}</option>
              ))}
            </select>

            <select
              value={form.currency}
              onChange={(e) => setField("currency", e.target.value)}
              className="input-pro"
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={resetForm} className="rounded-2xl border border-dinamita-line px-5 py-3">
              Restablecer
            </button>
            <button onClick={saveConfig} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
              Guardar configuración
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
        <h3 className="text-2xl font-bold mb-4">Vista previa</h3>

        <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 p-6 space-y-4">
          <div>
            <p className="text-sm text-dinamita-muted">Negocio</p>
            <p className="text-3xl font-black">{form.businessName}</p>
          </div>

          <div>
            <p className="text-sm text-dinamita-muted">Aplicación</p>
            <p className="text-xl font-bold">{form.appName}</p>
          </div>

          <div>
            <p className="text-sm text-dinamita-muted">Administrador</p>
            <p className="text-lg font-semibold">{form.ownerName}</p>
          </div>

          <div>
            <p className="text-sm text-dinamita-muted">Mensaje del ticket</p>
            <p className="text-base">{form.ticketMessage}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="badge-chip">Acento: {form.accent}</span>
            <span className="badge-chip">Moneda: {form.currency}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

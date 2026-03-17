import { useConfigStore } from "../../store/configStore";

const colorFields = [
  ["menuBg", "Color del menú"],
  ["appBg", "Fondo general"],
  ["panelBg", "Panel principal"],
  ["panelBg2", "Panel secundario"],
  ["borderColor", "Bordes"],
  ["accentColor", "Acento"],
  ["buttonBg", "Botones"],
  ["buttonText", "Texto botón"],
  ["textColor", "Texto principal"],
  ["mutedColor", "Texto secundario"],
];

export default function Configuracion() {
  const { form, message, setField, setThemeField, resetForm, saveConfig } = useConfigStore();

  return (
    <div className="p-6 space-y-6">
      <section className="soft-panel p-6">
        <h3 className="text-3xl font-black mb-5">Configuración y branding</h3>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-xl font-bold">Datos generales del negocio</h4>

            <input value={form.businessName} onChange={(e) => setField("businessName", e.target.value)} className="input-pro" placeholder="Nombre del negocio" />
            <input value={form.appName} onChange={(e) => setField("appName", e.target.value)} className="input-pro" placeholder="Nombre de la app" />
            <input value={form.ownerName} onChange={(e) => setField("ownerName", e.target.value)} className="input-pro" placeholder="Nombre del administrador" />
            <input value={form.address} onChange={(e) => setField("address", e.target.value)} className="input-pro" placeholder="Dirección" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="input-pro" placeholder="Teléfono" />
              <input value={form.email} onChange={(e) => setField("email", e.target.value)} className="input-pro" placeholder="Correo" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={form.facebook} onChange={(e) => setField("facebook", e.target.value)} className="input-pro" placeholder="Facebook" />
              <input value={form.instagram} onChange={(e) => setField("instagram", e.target.value)} className="input-pro" placeholder="Instagram" />
              <input value={form.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} className="input-pro" placeholder="WhatsApp" />
            </div>

            <input value={form.ticketMessage} onChange={(e) => setField("ticketMessage", e.target.value)} className="input-pro" placeholder="Mensaje del ticket" />

            <select value={form.currency} onChange={(e) => setField("currency", e.target.value)} className="input-pro">
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-bold">Colores de la app</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {colorFields.map(([key, label]) => (
                <label key={key} className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3">
                  <span className="block text-sm text-dinamita-muted mb-2">{label}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.theme?.[key] || "#000000"}
                      onChange={(e) => setThemeField(key, e.target.value)}
                      className="h-10 w-14 rounded overflow-hidden border border-dinamita-line bg-transparent"
                    />
                    <input
                      value={form.theme?.[key] || ""}
                      onChange={(e) => setThemeField(key, e.target.value)}
                      className="input-pro"
                      placeholder="#000000"
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={resetForm} className="rounded-2xl border border-dinamita-line px-5 py-3">
            Restablecer
          </button>
          <button onClick={saveConfig} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
            Guardar configuración
          </button>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3 text-sm">
            {message}
          </div>
        ) : null}
      </section>

      <section className="soft-panel p-6">
        <h3 className="text-2xl font-bold mb-4">Vista previa del ticket</h3>

        <div className="max-w-md rounded-3xl border border-dinamita-line bg-white text-black p-6">
          <div className="text-center border-b border-gray-300 pb-4 mb-4">
            <p className="text-2xl font-black">{form.businessName}</p>
            <p className="text-xs mt-1">{form.address || "Dirección pendiente"}</p>
            <p className="text-xs">{form.phone || "Teléfono pendiente"}</p>
            <p className="text-xs">{form.email || "Correo pendiente"}</p>
          </div>

          <div className="space-y-1 text-sm">
            <p>Facebook: {form.facebook || "-"}</p>
            <p>Instagram: {form.instagram || "-"}</p>
            <p>WhatsApp: {form.whatsapp || "-"}</p>
            <p>Moneda: {form.currency}</p>
          </div>

          <div className="border-t border-gray-300 mt-4 pt-4">
            <p className="text-sm">{form.ticketMessage}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState } from "react";
import { downloadBackupJson, restoreBackupFile } from "../../lib/backup";

export default function Respaldo() {
  const [message, setMessage] = useState("");
  const [meta, setMeta] = useState(null);

  const handleDownload = async () => {
    const payload = await downloadBackupJson();
    setMeta({
      exportedAt: payload.exportedAt,
      version: payload.version,
    });
    setMessage("Respaldo descargado correctamente.");
  };

  const handleRestore = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = await restoreBackupFile(file);
      setMeta({
        exportedAt: payload.exportedAt,
        version: payload.version,
      });
      setMessage("Respaldo restaurado correctamente. Recarga la vista si quieres verificar todo.");
    } catch (error) {
      setMessage("No se pudo restaurar el archivo. Verifica que sea un JSON válido de Dinamita POS Pro.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="p-6">
      <section className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-6 shadow-soft max-w-4xl">
        <h3 className="text-3xl font-black mb-5">Respaldo y restauración</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 p-5">
            <h4 className="text-xl font-bold mb-3">Crear respaldo</h4>
            <p className="text-sm text-dinamita-muted mb-4">
              Descarga un archivo JSON con ventas, membresías, caja, inventario, clientes, gastos y último ticket.
            </p>
            <button
              onClick={handleDownload}
              className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold"
            >
              Descargar respaldo
            </button>
          </div>

          <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 p-5">
            <h4 className="text-xl font-bold mb-3">Restaurar respaldo</h4>
            <p className="text-sm text-dinamita-muted mb-4">
              Carga un archivo JSON generado por Dinamita POS Pro para restaurar la información local.
            </p>
            <label className="inline-flex cursor-pointer rounded-2xl border border-dinamita-line px-5 py-3 font-semibold">
              Seleccionar archivo
              <input type="file" accept=".json,application/json" className="hidden" onChange={handleRestore} />
            </label>
          </div>
        </div>

        {meta ? (
          <div className="mt-6 rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-4 text-sm">
            <p><span className="text-dinamita-muted">Último respaldo detectado:</span> {meta.exportedAt}</p>
            <p><span className="text-dinamita-muted">Versión:</span> {meta.version}</p>
          </div>
        ) : null}

        {message ? (
          <div className="mt-4 rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-4 text-sm">
            {message}
          </div>
        ) : null}
      </section>
    </div>
  );
}

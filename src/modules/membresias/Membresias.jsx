import { useMemo, useState } from "react";
import { money } from "../../lib/format";
import { printTicket } from "../../lib/ticketPrinter";
import { useMembershipsStore } from "../../store/membershipsStore";
import { useClientsStore } from "../../store/clientsStore";
import { useAppDataStore } from "../../store/appDataStore";

export default function Membresias() {
  const clients = useClientsStore((s) => s.clients).filter((c) => c.active !== false);
  const lastTicket = useAppDataStore((s) => s.lastTicket);

  const {
    plans,
    memberships,
    form,
    planForm,
    plansQuery,
    lastSaved,
    infoMessage,
    isPlanManagerOpen,
    setField,
    resetForm,
    saveMembership,
    openPlanManager,
    closePlanManager,
    setPlansQuery,
    setPlanField,
    resetPlanForm,
    savePlan,
    editPlan,
    deletePlan,
    getFilteredPlans,
  } = useMembershipsStore();

  const [clientSearch, setClientSearch] = useState("");

  const filteredClients = useMemo(() => {
    const q = String(clientSearch || "").toLowerCase().trim();
    if (!q) return clients.slice(0, 8);
    return clients
      .filter((client) =>
        client.name.toLowerCase().includes(q) ||
        String(client.phone || "").toLowerCase().includes(q) ||
        String(client.email || "").toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [clients, clientSearch]);

  const activePlans = plans.filter((p) => p.active !== false);

  const handlePrint = () => {
    if (!lastTicket || lastTicket.type !== "membresia") return;
    printTicket(lastTicket);
  };

  const planRows = getFilteredPlans();

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[.95fr_1.15fr] gap-6">
      <section className="soft-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="text-3xl font-black">Membresías</h3>
          <button onClick={openPlanManager} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
            Agregar / administrar membresías
          </button>
        </div>

        <div className="space-y-4">
          <input
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="input-pro"
            placeholder="Buscar cliente por nombre, teléfono o correo..."
          />

          <select
            value={form.cliente}
            onChange={(e) => setField("cliente", e.target.value)}
            className="input-pro"
          >
            <option value="">Selecciona cliente</option>
            {filteredClients.map((client) => (
              <option key={client.id} value={client.name}>
                {client.name}
              </option>
            ))}
          </select>

          <select
            value={form.planId}
            onChange={(e) => setField("planId", e.target.value)}
            className="input-pro"
          >
            {activePlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-3">
            <input
              value={plans.find((p) => p.id === form.planId)?.days || 0}
              readOnly
              className="input-pro"
              placeholder="Días"
            />
            <input
              type="date"
              value={form.inicio}
              onChange={(e) => setField("inicio", e.target.value)}
              className="input-pro"
            />
            <input
              type="date"
              value={form.fin}
              readOnly
              className="input-pro"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              value={money(form.monto)}
              readOnly
              className="input-pro"
            />
            <div className="grid grid-cols-3 gap-2">
              {["Efectivo", "Tarjeta", "Transferencia"].map((m) => (
                <button
                  key={m}
                  onClick={() => setField("pago", m)}
                  className={`rounded-2xl px-3 py-3 text-sm font-semibold border ${
                    form.pago === m
                      ? "bg-dinamita-red border-dinamita-red text-white"
                      : "bg-dinamita-panel2 border border-dinamita-line"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <input
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            className="input-pro"
            placeholder="Notas"
          />

          <div className="grid grid-cols-2 gap-3">
            <button onClick={resetForm} className="rounded-2xl border border-dinamita-line px-5 py-3">
              Limpiar
            </button>
            <button
              onClick={() => saveMembership(false)}
              className="rounded-2xl bg-dinamita-panel2 border border-dinamita-line px-5 py-3"
            >
              Guardar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => saveMembership(true)}
              className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold"
            >
              Guardar y cobrar
            </button>
            <button
              onClick={handlePrint}
              className={`rounded-2xl border border-dinamita-line px-5 py-3 ${lastSaved?.ticketId ? "" : "opacity-60 cursor-not-allowed"}`}
            >
              Imprimir
            </button>
          </div>

          {infoMessage ? (
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-3 text-sm">
              {infoMessage}
            </div>
          ) : null}

          {lastSaved ? (
            <div className="rounded-2xl border border-dinamita-line bg-dinamita-panel2 px-4 py-4 text-sm">
              <p className="font-semibold">Última membresía</p>
              <p className="text-dinamita-muted mt-1">Cliente: {lastSaved.cliente}</p>
              <p className="text-dinamita-muted">Plan: {lastSaved.tipo}</p>
              <p className="text-dinamita-muted">Días: {lastSaved.days}</p>
              <p className="text-dinamita-muted">Pago: {lastSaved.pago}</p>
              <p className="mt-2 font-bold">{money(lastSaved.monto)}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="soft-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Membresías recientes</h3>
          <div className="text-sm text-dinamita-muted">Activas / Todas</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-dinamita-muted">
              <tr>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Días</th>
                <th className="pb-3">Inicio</th>
                <th className="pb-3">Fin</th>
                <th className="pb-3">Pago</th>
                <th className="pb-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((row) => (
                <tr key={row.id} className="border-t border-dinamita-line">
                  <td className="py-3">{row.cliente}</td>
                  <td className="py-3">{row.tipo}</td>
                  <td className="py-3">{row.days}</td>
                  <td className="py-3">{row.inicio}</td>
                  <td className="py-3">{row.fin}</td>
                  <td className="py-3">{row.pago}</td>
                  <td className="py-3 text-right font-semibold">{money(row.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isPlanManagerOpen ? (
        <section className="xl:col-span-2 soft-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h3 className="text-2xl font-bold">Administrador de membresías</h3>
            <button onClick={closePlanManager} className="rounded-2xl border border-dinamita-line px-4 py-2">
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[.8fr_1.2fr] gap-6">
            <div className="space-y-4">
              <input
                value={planForm.name}
                onChange={(e) => setPlanField("name", e.target.value)}
                className="input-pro"
                placeholder="Nombre de membresía"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={planForm.days}
                  onChange={(e) => setPlanField("days", e.target.value)}
                  className="input-pro"
                  placeholder="Días"
                />
                <input
                  type="number"
                  value={planForm.price}
                  onChange={(e) => setPlanField("price", e.target.value)}
                  className="input-pro"
                  placeholder="Precio"
                />
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={!!planForm.active}
                  onChange={(e) => setPlanField("active", e.target.checked)}
                />
                Membresía activa
              </label>

              <div className="flex flex-wrap gap-3">
                <button onClick={resetPlanForm} className="rounded-2xl border border-dinamita-line px-5 py-3">
                  Limpiar
                </button>
                <button onClick={savePlan} className="rounded-2xl bg-dinamita-red px-5 py-3 font-bold">
                  Guardar membresía
                </button>
              </div>
            </div>

            <div>
              <input
                value={plansQuery}
                onChange={(e) => setPlansQuery(e.target.value)}
                className="input-pro mb-4"
                placeholder="Buscar membresía..."
              />

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-dinamita-muted">
                    <tr>
                      <th className="pb-3">Nombre</th>
                      <th className="pb-3">Días</th>
                      <th className="pb-3">Precio</th>
                      <th className="pb-3">Estado</th>
                      <th className="pb-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planRows.map((row) => (
                      <tr key={row.id} className="border-t border-dinamita-line">
                        <td className="py-3 font-medium">{row.name}</td>
                        <td className="py-3">{row.days}</td>
                        <td className="py-3">{money(row.price)}</td>
                        <td className="py-3">{row.active ? "Activa" : "Inactiva"}</td>
                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => editPlan(row)} className="rounded-xl border border-dinamita-line px-3 py-1">
                              Editar
                            </button>
                            <button onClick={() => deletePlan(row.id)} className="rounded-xl border border-dinamita-line px-3 py-1">
                              Borrar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

import { money } from "../../lib/format";
import { useAppDataStore } from "../../store/appDataStore";
import { printTicket } from "../../lib/ticketPrinter";
import { useConfigStore } from "../../store/configStore";

export default function Tickets() {
  const { lastTicket, clearLastTicket } = useAppDataStore();
  const businessName = useConfigStore((s) => s.config.businessName);
  const ticketMessage = useConfigStore((s) => s.config.ticketMessage);

  return (
    <div className="p-6">
      <section className="rounded-3xl border border-dinamita-line bg-dinamita-panel p-6 shadow-soft max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="text-3xl font-black">Último ticket</h3>
          <div className="flex gap-3">
            <button
              onClick={() => lastTicket && printTicket(lastTicket)}
              className={`rounded-2xl px-4 py-2 ${lastTicket ? "bg-dinamita-red text-white" : "border border-dinamita-line opacity-60 cursor-not-allowed"}`}
            >
              Imprimir ticket
            </button>
            <button onClick={clearLastTicket} className="rounded-2xl border border-dinamita-line px-4 py-2">
              Limpiar vista
            </button>
          </div>
        </div>

        {lastTicket ? (
          <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 p-6">
            <div className="text-center border-b border-dinamita-line pb-4 mb-4">
              <p className="text-2xl font-black">{businessName}</p>
              <p className="text-sm text-dinamita-muted mt-1">Ticket {lastTicket.type}</p>
            </div>

            <div className="space-y-2 text-sm">
              <p><span className="text-dinamita-muted">Folio:</span> {lastTicket.folio}</p>
              <p><span className="text-dinamita-muted">Fecha:</span> {(lastTicket.at || "").replace("T", " ").slice(0, 16)}</p>
              <p><span className="text-dinamita-muted">Cliente:</span> {lastTicket.customer}</p>
              <p><span className="text-dinamita-muted">Pago:</span> {lastTicket.paymentMethod}</p>
              {lastTicket.membershipType ? <p><span className="text-dinamita-muted">Membresía:</span> {lastTicket.membershipType}</p> : null}
              {lastTicket.membershipDays ? <p><span className="text-dinamita-muted">Días:</span> {lastTicket.membershipDays}</p> : null}
              {lastTicket.note ? <p><span className="text-dinamita-muted">Nota:</span> {lastTicket.note}</p> : null}
            </div>

            <div className="mt-5 border-t border-dinamita-line pt-4 space-y-3">
              {lastTicket.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-dinamita-muted">x{item.qty || 1}</p>
                  </div>
                  <div className="font-bold">{money(item.total || item.price || 0)}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-dinamita-line pt-4 flex items-center justify-between text-2xl font-black">
              <span>Total</span>
              <span>{money(lastTicket.total || 0)}</span>
            </div>
            <p className="text-sm text-dinamita-muted mt-4">{ticketMessage}</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-dinamita-line bg-dinamita-panel2 p-6 text-dinamita-muted">
            Aún no hay ticket generado en esta sesión.
          </div>
        )}
      </section>
    </div>
  );
}

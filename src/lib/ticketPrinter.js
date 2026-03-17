export function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

import { useConfigStore } from "../store/configStore";

export function buildTicketHtml(ticket) {
  const rows = (ticket?.items || [])
    .map((item) => {
      const qty = Number(item.qty || 1);
      const total = Number(item.total || item.price || 0);
      return `
        <div class="row item">
          <div>
            <div class="name">${item.name || "Concepto"}</div>
            <div class="muted">x${qty}</div>
          </div>
          <div class="total">${money(total)}</div>
        </div>
      `;
    })
    .join("");

  const cfg = useConfigStore.getState().config;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${ticket?.folio || "Ticket"}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 16px; color: #111; background: #fff; }
  .ticket { width: 300px; margin: 0 auto; }
  .center { text-align: center; }
  .title { font-weight: 800; font-size: 20px; }
  .muted { color: #555; font-size: 12px; }
  .divider { border-top: 1px dashed #999; margin: 12px 0; }
  .row { display: flex; justify-content: space-between; gap: 10px; font-size: 13px; margin: 6px 0; }
  .item { align-items: start; }
  .name { font-weight: 700; }
  .total-line { font-size: 18px; font-weight: 800; margin-top: 10px; }
  .footer { margin-top: 14px; font-size: 12px; text-align: center; }
  @media print { body { padding: 0; } .ticket { width: 58mm; } }
</style>
</head>
<body>
  <div class="ticket">
    <div class="center">
      <div class="title">${cfg?.businessName || "DINÁMITA GYM"}</div>
      <div class="muted">Ticket ${ticket?.type || ""}</div>
    </div>

    <div class="divider"></div>

    <div class="row"><span>Folio</span><span>${ticket?.folio || "-"}</span></div>
    <div class="row"><span>Fecha</span><span>${String(ticket?.at || "").replace("T", " ").slice(0, 16) || "-"}</span></div>
    <div class="row"><span>Cliente</span><span>${ticket?.customer || "Mostrador"}</span></div>
    <div class="row"><span>Pago</span><span>${ticket?.paymentMethod || "Efectivo"}</span></div>
    ${ticket?.membershipType ? `<div class="row"><span>Membresía</span><span>${ticket.membershipType}</span></div>` : ""}
    ${ticket?.membershipStart ? `<div class="row"><span>Inicio</span><span>${ticket.membershipStart}</span></div>` : ""}
${ticket?.membershipEnd ? `<div class="row"><span>Fin</span><span>${ticket.membershipEnd}</span></div>` : ""}
    ${ticket?.note ? `<div class="row"><span>Nota</span><span>${ticket.note}</span></div>` : ""}

    <div class="divider"></div>

    ${rows || '<div class="muted center">Sin conceptos</div>'}

    <div class="divider"></div>

    <div class="row total-line"><span>Total</span><span>${money(ticket?.total || 0)}</span></div>

    <div class="footer">
      ${cfg?.ticketMessage || "Gracias por tu compra en Dinamita Gym 💥"}
    </div>
  </div>
</body>
</html>`;
}

export function printTicket(ticket) {
  const html = buildTicketHtml(ticket);
  const win = window.open("", "_blank", "width=420,height=700");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 250);
  return true;
}

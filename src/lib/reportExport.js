export function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [
    headers.map(esc).join(","),
    ...rows.map((row) => headers.map((h) => esc(row[h])).join(",")),
  ];
  return lines.join("\n");
}

export function downloadCsv(filename, rows) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function buildPrintableReportHtml(title, rows) {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const thead = headers.map((h) => `<th>${h}</th>`).join("");
  const tbody = rows.map((row) => {
    const tds = headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("");
    return `<tr>${tds}</tr>`;
  }).join("");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 18px; color:#111; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  p { font-size: 12px; color:#555; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
  th { background: #f3f3f3; }
</style>
</head>
<body>
  <h1>${title}</h1>
  <p>Generado: ${new Date().toLocaleString("es-MX")}</p>
  <table>
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody}</tbody>
  </table>
</body>
</html>`;
}

export function printReport(title, rows) {
  const html = buildPrintableReportHtml(title, rows);
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
  return true;
}

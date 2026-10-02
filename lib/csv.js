/* CSV export helpers — pure, client-safe */

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function toCSV(rows, columns) {
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCell(typeof c.get === 'function' ? c.get(row) : row[c.key])).join(',')
  );
  return [header, ...lines].join('\r\n');
}

export function downloadCSV(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

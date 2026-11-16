export function formatCsv(rows: unknown[][]): string {
  return '\uFEFF' + rows.map((row) => row.map((value) => {
    const text = String(value ?? '');
    const safe = typeof value === 'string' && (/^\s*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) ? "'" + text : text;
    return '"' + safe.replace(/"/g, '""') + '"';
  }).join(',')).join('\r\n');
}

export function downloadCsv(filename: string, rows: unknown[][]) {
  const url = URL.createObjectURL(new Blob([formatCsv(rows)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

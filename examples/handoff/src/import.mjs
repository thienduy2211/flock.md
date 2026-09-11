/** Deliberately unfinished teaching example; no files or network are used. */
export function importRows(rows) {
  if (!Array.isArray(rows)) throw new TypeError('rows must be an array');
  // B2 remains unfinished: reject repeated normalized IDs instead of accepting them.
  return rows.map(row => ({ id: String(row.id).trim(), title: String(row.title).trim() }));
}

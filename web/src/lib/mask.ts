export function maskDocumento(doc: string): string {
  const digitos = doc.replace(/\D/g, "");
  if (digitos.length === 11 && /^[\d.\-\s]+$/.test(doc)) return `***.***.${digitos.slice(6, 9)}-**`;
  if (!doc) return "";
  return "*".repeat(Math.max(doc.length - 3, 0)) + doc.slice(-3);
}

/** Idade em anos completos a partir de "aaaa-mm-dd". */
export function idade(dataNascimento: string, hoje: Date = new Date()): number {
  const [y, m, d] = dataNascimento.split("-").map(Number);
  let anos = hoje.getFullYear() - y;
  if (hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d)) anos--;
  return anos;
}

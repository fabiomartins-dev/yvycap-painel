const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function moeda(valor: number): string {
  return brl.format(valor);
}

export function moedaCompacta(valor: number): string {
  const abs = Math.abs(valor);
  const sinal = valor < 0 ? '-' : '';
  const fmt = (n: number, sufixo: string) =>
    `${sinal}R$ ${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${sufixo}`;
  if (abs >= 1_000_000_000) return fmt(abs / 1_000_000_000, 'B');
  if (abs >= 1_000_000) return fmt(abs / 1_000_000, 'M');
  if (abs >= 1_000) return fmt(abs / 1_000, 'K');
  return `${sinal}R$ ${abs.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
}

export function data(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(`${iso.slice(0, 10)}T12:00:00`) : iso;
  return d.toLocaleDateString('pt-BR');
}

export function dataLonga(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function mesAno(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
}

export function percentualMes(taxa: number): string {
  return `${(taxa * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% a.m.`;
}

export function mascararCpf(cpf: string): string {
  const dig = cpf.replace(/\D/g, '');
  if (dig.length !== 11) return '***';
  return `***.${dig.slice(3, 6)}.${dig.slice(6, 9)}-**`;
}

export function mascararDocumento(doc: string): string {
  const dig = doc.replace(/\D/g, '');
  if (dig.length === 11) return mascararCpf(doc);
  if (dig.length === 14) return `${dig.slice(0, 2)}.***.***/${dig.slice(8, 12)}-${dig.slice(12)}`;
  return '***';
}

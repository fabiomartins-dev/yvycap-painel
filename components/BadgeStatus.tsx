import { Badge } from '@mantine/core';

const CORES: Record<string, string> = {
  Ativo: 'brand.7',
  'Carência': 'gold.6',
  Encerrado: 'gray',
  Estornado: 'red',
  'Aguardando conciliação': 'orange',
  pendente: 'orange',
  aprovado: 'brand.7',
  pago: 'brand.8',
  cancelado: 'gray',
  previsto: 'gold.6',
  retido: 'orange',
  parcial: 'gold.6',
};

const ROTULOS: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  pago: 'Pago',
  cancelado: 'Cancelado',
  previsto: 'Previsto',
  retido: 'Retido (30 dias)',
  parcial: 'Parcial',
};

export function BadgeStatus({ status }: { status: string }) {
  return (
    <Badge color={CORES[status] ?? 'gray'} variant="light" size="sm">
      {ROTULOS[status] ?? status}
    </Badge>
  );
}

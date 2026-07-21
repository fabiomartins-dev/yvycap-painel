import { Card, Text } from '@mantine/core';

export function StatCard({
  rotulo,
  valor,
  detalhe,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  destaque?: boolean;
}) {
  return (
    <Card padding="md" style={destaque ? { borderColor: '#c8a45e' } : undefined}>
      <Text fz="xs" c="#66756e" tt="uppercase" fw={600} style={{ letterSpacing: '0.06em' }}>
        {rotulo}
      </Text>
      <Text fz={26} fw={700} c={destaque ? '#124534' : '#22302b'} ff="var(--font-fraunces), serif" mt={2}>
        {valor}
      </Text>
      {detalhe && (
        <Text fz="xs" c="#66756e" mt={2}>
          {detalhe}
        </Text>
      )}
    </Card>
  );
}

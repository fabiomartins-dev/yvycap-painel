'use client';

import { Card, Table, Text } from '@mantine/core';
import { data, moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { BadgeStatus } from '@/components/BadgeStatus';
import type { ResgateCarteira } from '@/services/parceria';

export function ResgatesParceriaScreen({ resgates }: { resgates: ResgateCarteira[] }) {
  return (
    <>
      <PageHeader
        titulo="Resgates"
        descricao="Solicitações de resgate antecipado dos clientes da sua carteira (aviso prévio de 90 dias)."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Parceria', href: '/parceria' },
          { rotulo: 'Resgates' },
        ]}
      />
      <Card>
        {resgates.length === 0 ? (
          <Text c="#66756e" py="lg" ta="center">
            Nenhuma solicitação de resgate na sua carteira. Quando um cliente solicitar resgate
            antecipado, o prazo de 90 dias e o status aparecerão aqui.
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={720}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Cliente</Table.Th>
                  <Table.Th>Contrato</Table.Th>
                  <Table.Th>Aporte</Table.Th>
                  <Table.Th>Solicitado em</Table.Th>
                  <Table.Th>Liberação (90 dias)</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {resgates.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td>{r.clienteNome}</Table.Td>
                    <Table.Td fw={600}>{r.contratoNumero}</Table.Td>
                    <Table.Td>{moeda(r.valorAporte)}</Table.Td>
                    <Table.Td>{data(r.dataSolicitacao)}</Table.Td>
                    <Table.Td>{data(r.dataLiberacao)}</Table.Td>
                    <Table.Td>
                      <BadgeStatus status={r.status} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>
    </>
  );
}

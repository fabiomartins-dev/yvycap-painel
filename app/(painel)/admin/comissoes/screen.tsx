'use client';

import { Card, Table, Text } from '@mantine/core';
import { moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { BadgeStatus } from '@/components/BadgeStatus';
import type { ComissaoConsolidada } from '@/services/admin';

const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function rotuloCompetencia(comp: string): string {
  const [y, m] = comp.split('-').map(Number);
  return `${MESES_PT[m - 1]}/${y}`;
}

export function ComissoesAdminScreen({ linhas }: { linhas: ComissaoConsolidada[] }) {
  return (
    <>
      <PageHeader
        titulo="Comissões"
        descricao="Apuração consolidada por parceiro e por mês, com retenções, estornos e status de pagamento."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Administração', href: '/admin' },
          { rotulo: 'Comissões' },
        ]}
      />
      <Card>
        {linhas.length === 0 ? (
          <Text c="#66756e" py="lg" ta="center">
            Nenhuma comissão apurada ainda.
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={860}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Competência</Table.Th>
                  <Table.Th>Parceiro</Table.Th>
                  <Table.Th>Entrada (1%)</Table.Th>
                  <Table.Th>Recorrente (1% a.m.)</Table.Th>
                  <Table.Th>Estornos</Table.Th>
                  <Table.Th>Em retenção (30 dias)</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {linhas.map((l, i) => (
                  <Table.Tr key={i}>
                    <Table.Td fw={600}>{rotuloCompetencia(l.competencia)}</Table.Td>
                    <Table.Td>{l.parceiroNome}</Table.Td>
                    <Table.Td>{l.entrada > 0 ? moeda(l.entrada) : '—'}</Table.Td>
                    <Table.Td>{l.recorrente > 0 ? moeda(l.recorrente) : '—'}</Table.Td>
                    <Table.Td c={l.estornos < 0 ? 'red' : undefined} fw={l.estornos < 0 ? 600 : undefined}>
                      {l.estornos < 0 ? moeda(l.estornos) : '—'}
                    </Table.Td>
                    <Table.Td>{l.retido > 0 ? moeda(l.retido) : '—'}</Table.Td>
                    <Table.Td fw={700} c={l.total < 0 ? 'red' : '#124534'}>
                      {moeda(l.total)}
                    </Table.Td>
                    <Table.Td>
                      <BadgeStatus status={l.status} />
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

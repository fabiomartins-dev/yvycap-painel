'use client';

import { Card, Table, Text } from '@mantine/core';
import { AnchorLink } from '@/components/AppLink';
import { data, moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { BadgeStatus } from '@/components/BadgeStatus';
import type { ContratoCarteira } from '@/services/parceria';

export function ContratosParceriaScreen({ contratos }: { contratos: ContratoCarteira[] }) {
  return (
    <>
      <PageHeader
        titulo="Contratos"
        descricao="Todos os contratos originados por você, com o status de conciliação do aporte."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Parceria', href: '/parceria' },
          { rotulo: 'Contratos' },
        ]}
      />
      <Card>
        {contratos.length === 0 ? (
          <Text c="#66756e" py="lg" ta="center">
            Você ainda não originou contratos.
          </Text>
        ) : (
          <>
            <Table.ScrollContainer minWidth={760}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Contrato</Table.Th>
                    <Table.Th>Cliente</Table.Th>
                    <Table.Th>Aporte</Table.Th>
                    <Table.Th>Início</Table.Th>
                    <Table.Th>Conciliação</Table.Th>
                    <Table.Th>Comissão</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {contratos.map((c) => (
                    <Table.Tr key={c.id}>
                      <Table.Td>
                        <AnchorLink href={`/parceria/contratos/${c.id}`} fw={600} c="#124534">
                          {c.numero}
                        </AnchorLink>
                      </Table.Td>
                      <Table.Td>{c.clienteNome}</Table.Td>
                      <Table.Td>{moeda(c.valorAporte)}</Table.Td>
                      <Table.Td>{data(c.dataInicio)}</Table.Td>
                      <Table.Td>
                        <BadgeStatus status={c.conciliado ? 'pago' : 'pendente'} />
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm" c={c.comissaoReconhecida ? '#124534' : '#66756e'} fw={c.comissaoReconhecida ? 600 : 400}>
                          {c.comissaoReconhecida ? 'Reconhecida' : c.estornado ? 'Estornada' : 'Aguardando conciliação'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <BadgeStatus status={c.statusRotulo} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <Text fz="xs" c="#66756e" mt="xs">
              A comissão só é reconhecida após o aporte conciliado pela YVYCAP.
            </Text>
          </>
        )}
      </Card>
    </>
  );
}

'use client';

import Link from 'next/link';
import { Anchor, Button, Card, Table, Text, Title } from '@mantine/core';
import { BadgeStatus } from '@/components/BadgeStatus';
import { data, moeda, percentualMes } from '@/lib/format';
import type { ContratoInvestidor } from '@/services/investimentos';

export function DashboardInvestidor({ contratos }: { contratos: ContratoInvestidor[] }) {
  return (
    <>
      <Card mt="md">
        <Title order={3} fz="h4" mb="sm">
          Contratos
        </Title>
        <Table.ScrollContainer minWidth={720}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Contrato</Table.Th>
                <Table.Th>Fase</Table.Th>
                <Table.Th>Valor aportado</Table.Th>
                <Table.Th>Taxa</Table.Th>
                <Table.Th>Início</Table.Th>
                <Table.Th>Vencimento</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {contratos.map((c) => (
                <Table.Tr key={c.id}>
                  <Table.Td>
                    <Anchor component={Link} href={`/investimentos/contratos/${c.id}`} fw={600} c="#124534">
                      {c.numero}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>Fase {c.fase}</Table.Td>
                  <Table.Td>{moeda(c.valorAporte)}</Table.Td>
                  <Table.Td>{percentualMes(c.taxaMensal)}</Table.Td>
                  <Table.Td>{data(c.dataInicio)}</Table.Td>
                  <Table.Td>{data(c.dataVencimento)}</Table.Td>
                  <Table.Td>
                    <BadgeStatus status={c.statusRotulo} />
                  </Table.Td>
                  <Table.Td>
                    <Button
                      component={Link}
                      href={`/investimentos/contratos/${c.id}`}
                      size="compact-sm"
                      variant="filled"
                      color="brand.7"
                      c="white"
                      rightSection={
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      }
                    >
                      Ver detalhe
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Text fz="xs" c="#66756e" mt={4}>
          Clique em “Ver detalhe” para abrir a tela completa do contrato, com cronograma e
          documentos.
        </Text>
      </Card>
    </>
  );
}

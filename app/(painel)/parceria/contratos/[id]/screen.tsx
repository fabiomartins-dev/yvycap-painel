'use client';

import { Card, SimpleGrid, Table, Text } from '@mantine/core';
import { data, moeda, percentualMes } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { BadgeStatus } from '@/components/BadgeStatus';
import type { ContratoCarteira } from '@/services/parceria';

export function ContratoParceriaScreen({ contrato: c }: { contrato: ContratoCarteira }) {
  return (
    <>
      <PageHeader
        titulo={`Contrato ${c.numero}`}
        descricao={`Cliente: ${c.clienteNome}`}
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Parceria', href: '/parceria' },
          { rotulo: 'Contratos', href: '/parceria/contratos' },
          { rotulo: c.numero },
        ]}
      />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb="md">
        <StatCard rotulo="Aporte" valor={moeda(c.valorAporte)} destaque />
        <StatCard rotulo="Saldo ativo" valor={moeda(c.saldoAtivo)} detalhe="Base da comissão recorrente" />
        <StatCard
          rotulo="Comissão/mês"
          valor={c.comissaoReconhecida ? moeda(c.comissaoMensalAtual) : '—'}
          detalhe={c.comissaoReconhecida ? '1% a.m. sobre o saldo ativo' : 'Aguardando conciliação do aporte'}
        />
        <StatCard
          rotulo="Comissão de entrada"
          valor={c.comissaoReconhecida ? moeda(c.valorAporte * 0.01) : '—'}
          detalhe="1% do aporte · retenção de 30 dias"
        />
      </SimpleGrid>

      <Card>
        <Table variant="vertical" layout="fixed">
          <Table.Tbody>
            <Table.Tr>
              <Table.Th w={220}>Status</Table.Th>
              <Table.Td>
                <BadgeStatus status={c.statusRotulo} />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Fase</Table.Th>
              <Table.Td>
                Fase {c.fase} · {percentualMes(c.taxaMensal)}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Início (entrada do recurso)</Table.Th>
              <Table.Td>{data(c.dataInicio)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Vencimento (36 meses)</Table.Th>
              <Table.Td>{data(c.dataVencimento)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Conciliação do aporte</Table.Th>
              <Table.Td>
                <BadgeStatus status={c.conciliado ? 'pago' : 'pendente'} />
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <Text fz="xs" c="#66756e" mt="sm">
          O saldo ativo diminui com amortizações/quitações e zera no vencimento. Valor estornado
          não gera comissão.
        </Text>
      </Card>
    </>
  );
}

'use client';

import { Card, SimpleGrid, Table, Text, Title } from '@mantine/core';
import { data, moeda, percentualMes } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { BadgeStatus } from '@/components/BadgeStatus';
import { ContratosAdmin } from '@/components/admin/ContratosAdmin';
import type { ContratoAdmin } from '@/services/admin';

export function ContratoAdminDetalheScreen({ contrato: c }: { contrato: ContratoAdmin }) {
  return (
    <>
      <PageHeader
        titulo={`Contrato ${c.numero}`}
        descricao={`${c.investidorNome} · ${c.parceiroNome}`}
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Administração', href: '/admin' },
          { rotulo: 'Contratos', href: '/admin/contratos' },
          { rotulo: c.numero },
        ]}
      />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb="md">
        <StatCard rotulo="Aporte" valor={moeda(c.valorAporte)} destaque />
        <StatCard rotulo="Saldo ativo" valor={moeda(c.saldoAtivo)} />
        <StatCard rotulo="Fase / taxa" valor={`Fase ${c.fase}`} detalhe={percentualMes(c.taxaMensal)} />
        <StatCard rotulo="Vencimento" valor={data(c.dataVencimento)} detalhe={`Início: ${data(c.dataInicio)}`} />
      </SimpleGrid>

      {c.amortizacoes.length > 0 && (
        <Card mb="md">
          <Title order={3} fz="h4" mb="sm">
            Amortizações e quitações registradas
          </Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Data efetiva</Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Valor</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {c.amortizacoes.map((a, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{data(a.data)}</Table.Td>
                  <Table.Td>{a.tipo === 'quitacao' ? 'Quitação antecipada (aviso 60 dias)' : 'Amortização (aviso 60 dias)'}</Table.Td>
                  <Table.Td fw={600}>{moeda(a.valor)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      <Title order={3} fz="h4" mb="xs">
        Ações do contrato
      </Title>
      <Text fz="sm" c="#66756e" mb="sm">
        Use a tabela abaixo para conciliar o aporte, registrar amortização/quitação antecipada
        (aviso de 60 dias) ou encerrar no vencimento.
      </Text>
      <ContratosAdmin contratos={[c]} />

      <Card mt="md">
        <Table variant="vertical" layout="fixed">
          <Table.Tbody>
            <Table.Tr>
              <Table.Th w={220}>Status</Table.Th>
              <Table.Td>
                <BadgeStatus status={c.statusRotulo} />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Conciliação do aporte</Table.Th>
              <Table.Td>
                <BadgeStatus status={c.conciliado ? 'pago' : 'pendente'} />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Condições</Table.Th>
              <Table.Td>
                <Text fz="sm">
                  36 meses · juros simples · carência de 6 meses (juros pagos no vencimento) ·
                  resgate antecipado com aviso de 90 dias · quitação pela YVYCAP com aviso de 60
                  dias · cessão somente com aprovação da YVYCAP · sem renovação automática.
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card>
    </>
  );
}

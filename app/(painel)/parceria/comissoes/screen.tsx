'use client';

import { Card, Group, SimpleGrid, Table, Text, Title } from '@mantine/core';
import { data, moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { ButtonLink } from '@/components/AppLink';
import { StatCard } from '@/components/StatCard';
import { BadgeStatus } from '@/components/BadgeStatus';
import { ExtratoTransacoes } from '@/components/parceria/ExtratoTransacoes';
import type { ExtratoComissoes } from '@/services/parceria';

export function ComissoesScreen({ extrato }: { extrato: ExtratoComissoes | null }) {
  if (!extrato || extrato.meses.length === 0) {
    return (
      <>
        <PageHeader
          titulo="Comissões"
          migalhas={[{ rotulo: 'Painel', href: '/' }, { rotulo: 'Painel do Parceiro', href: '/parceria' }, { rotulo: 'Comissões' }]}
        />
        <Card padding="xl">
          <Text c="#66756e" ta="center" py="lg">
            Ainda não há comissões reconhecidas. Elas aparecem aqui após o primeiro aporte
            conciliado da sua carteira.
          </Text>
        </Card>
      </>
    );
  }

  return (
    <>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <PageHeader
          titulo="Comissões"
          descricao="Extrato mês a mês: entrada (1%, retenção de 30 dias), recorrentes (1% a.m.) e estornos."
          migalhas={[{ rotulo: 'Painel', href: '/' }, { rotulo: 'Painel do Parceiro', href: '/parceria' }, { rotulo: 'Comissões' }]}
        />
        <ButtonLink
          href="/parceria/comissoes/resgatar"
          color="gold.5"
          c="#0c352a"
          fw={600}
          disabled={extrato.saldoDisponivel <= 0}
        >
          Solicitar resgate
        </ButtonLink>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 3 }} mb="md">
        <StatCard rotulo="Total já pago" valor={moeda(extrato.totalPago)} destaque />
        <StatCard
          rotulo="Disponível para resgate"
          valor={moeda(extrato.saldoDisponivel)}
          detalhe="Comissão paga ainda não resgatada"
        />
        <StatCard rotulo="Previsto (a pagar)" valor={moeda(extrato.totalPrevisto)} />
      </SimpleGrid>

      {extrato.resgatesComissao.length > 0 && (
        <Card mb="md">
          <Title order={3} fz="h4" mb="sm">
            Solicitações de resgate de comissão
          </Title>
          <Table.ScrollContainer minWidth={480}>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Solicitado em</Table.Th>
                  <Table.Th>Valor</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {extrato.resgatesComissao.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td>{data(r.dataSolicitacao)}</Table.Td>
                    <Table.Td fw={600}>{moeda(r.valor)}</Table.Td>
                    <Table.Td>
                      <BadgeStatus status={r.status} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      )}

      <Card mb="md">
        <Title order={3} fz="h4" mb="sm">
          Extrato de comissões
        </Title>
        <ExtratoTransacoes lancamentos={extrato.meses.flatMap((m) => m.lancamentos)} />
      </Card>

      <Card>
        <Title order={3} fz="h4" mb="sm">
          Previsão dos próximos pagamentos
        </Title>
        {extrato.proximosPagamentos.length === 0 ? (
          <Text c="#66756e">Sem pagamentos previstos.</Text>
        ) : (
          <Table.ScrollContainer minWidth={560}>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Data prevista</Table.Th>
                  <Table.Th>Contrato</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Valor</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {extrato.proximosPagamentos.map((l, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{data(l.dataPagamento)}</Table.Td>
                    <Table.Td fw={600}>{l.contratoNumero}</Table.Td>
                    <Table.Td>{l.tipo === 'entrada' ? 'Entrada (1%)' : 'Recorrente (1% a.m.)'}</Table.Td>
                    <Table.Td fw={600}>{moeda(l.valor)}</Table.Td>
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

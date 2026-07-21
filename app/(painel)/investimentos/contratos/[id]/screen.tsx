'use client';

import { Card, Grid, Group, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import { data, moeda, percentualMes } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { BadgeStatus } from '@/components/BadgeStatus';
import { BotaoResgate } from '@/components/investimentos/BotaoResgate';
import { BotaoDownload } from '@/components/investimentos/BotaoDownload';
import type { DetalheContrato } from '@/services/investimentos';

const tipoRotulo = { carencia: 'Carência', juros: 'Juros mensais', vencimento: 'Vencimento' } as const;

export function ContratoInvestidorScreen({ det }: { det: DetalheContrato }) {
  const { contrato, cronograma, documentos, resgate } = det;

  return (
    <>
      <PageHeader
        titulo={`Contrato ${contrato.numero}`}
        descricao="Resumo, cronograma de pagamentos e documentos vinculados."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Meus Investimentos', href: '/investimentos' },
          { rotulo: contrato.numero },
        ]}
      />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb="md">
        <StatCard rotulo="Valor aportado" valor={moeda(contrato.valorAporte)} destaque />
        <StatCard rotulo="Taxa da fase" valor={percentualMes(contrato.taxaMensal)} detalhe={`Fase ${contrato.fase} · juros simples`} />
        <StatCard rotulo="Juros mensais" valor={moeda(contrato.jurosMensal)} detalhe="Pagos do 7º ao 36º mês" />
        <StatCard rotulo="Total já recebido" valor={moeda(contrato.totalRecebido)} />
      </SimpleGrid>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card>
            <Title order={3} fz="h4" mb="sm">
              Cronograma de pagamentos
            </Title>
            <Table.ScrollContainer minWidth={560}>
              <Table striped highlightOnHover stickyHeader mah={480} style={{ display: 'block', overflowY: 'auto', maxHeight: 480 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Mês</Table.Th>
                    <Table.Th>Data</Table.Th>
                    <Table.Th>Tipo</Table.Th>
                    <Table.Th>Valor</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {cronograma.map((p) => (
                    <Table.Tr key={p.mes}>
                      <Table.Td>{p.mes}º</Table.Td>
                      <Table.Td>{data(p.data)}</Table.Td>
                      <Table.Td>
                        <Text fz="sm">{tipoRotulo[p.tipo]}</Text>
                        <Text fz="xs" c="#66756e">
                          {p.descricao}
                        </Text>
                      </Table.Td>
                      <Table.Td fw={p.tipo === 'vencimento' ? 700 : undefined}>
                        {p.valor > 0 ? moeda(p.valor) : '—'}
                      </Table.Td>
                      <Table.Td>
                        {p.valor > 0 ? <BadgeStatus status={p.status} /> : <BadgeStatus status="Carência" />}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Card>
              <Title order={3} fz="h4" mb="sm">
                Resumo
              </Title>
              <Stack gap={6} fz="sm">
                <Group justify="space-between">
                  <Text fz="sm" c="#66756e">
                    Status
                  </Text>
                  <BadgeStatus status={contrato.statusRotulo} />
                </Group>
                <Group justify="space-between">
                  <Text fz="sm" c="#66756e">
                    Início (entrada do recurso)
                  </Text>
                  <Text fz="sm">{data(contrato.dataInicio)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fz="sm" c="#66756e">
                    Vencimento (36 meses)
                  </Text>
                  <Text fz="sm">{data(contrato.dataVencimento)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fz="sm" c="#66756e">
                    Juros da carência (pagos no fim)
                  </Text>
                  <Text fz="sm">{moeda(contrato.jurosMensal * 6)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fz="sm" c="#66756e">
                    Próximo pagamento
                  </Text>
                  <Text fz="sm">
                    {contrato.proximoPagamento
                      ? `${moeda(contrato.proximoPagamento.valor)} em ${data(contrato.proximoPagamento.data)}`
                      : '—'}
                  </Text>
                </Group>
              </Stack>
              <Text fz="xs" c="#66756e" mt="sm">
                Sem renovação automática. Cessão de contrato somente com aprovação da YVYCAP.
              </Text>
            </Card>

            <Card>
              <Title order={3} fz="h4" mb="sm">
                Documentos
              </Title>
              {documentos.length === 0 ? (
                <Text fz="sm" c="#66756e">
                  Nenhum documento disponível ainda.
                </Text>
              ) : (
                <Stack gap="xs">
                  {documentos.map((d) => (
                    <Group key={d.id} justify="space-between" wrap="nowrap">
                      <Text fz="sm" style={{ flex: 1 }}>
                        {d.nome}
                      </Text>
                      <BotaoDownload nome={d.nome} />
                    </Group>
                  ))}
                </Stack>
              )}
            </Card>

            {contrato.status !== 'encerrado' && (
              <BotaoResgate
                contratoId={contrato.id}
                contratoNumero={contrato.numero}
                resgateExistente={resgate}
              />
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}

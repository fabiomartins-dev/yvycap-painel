'use client';

import { Card, Grid, Stack, Stepper, Table, Text, Timeline, Title } from '@mantine/core';
import { AnchorLink } from '@/components/AppLink';
import { data, moeda } from '@/lib/format';
import { ESTAGIOS_PIPELINE } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { BadgeStatus } from '@/components/BadgeStatus';
import type { DetalheCliente } from '@/services/parceria';

export function ClienteDetalheScreen({ det }: { det: DetalheCliente }) {
  const { cliente, contratos } = det;
  const indiceEstagio = ESTAGIOS_PIPELINE.findIndex((e) => e.valor === cliente.estagio);

  return (
    <>
      <PageHeader
        titulo={cliente.nome}
        descricao={`${cliente.email} · ${cliente.telefone}`}
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Painel do Parceiro', href: '/parceria' },
          { rotulo: 'Clientes', href: '/parceria/clientes' },
          { rotulo: cliente.nome },
        ]}
      />

      <Card mb="md">
        <Title order={3} fz="h4" mb="md">
          Pipeline
        </Title>
        <Stepper active={indiceEstagio + 1} size="xs" wrap orientation="horizontal" color="brand.8">
          {ESTAGIOS_PIPELINE.map((e) => (
            <Stepper.Step key={e.valor} label={e.rotulo} />
          ))}
        </Stepper>
      </Card>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card>
            <Title order={3} fz="h4" mb="sm">
              Contratos
            </Title>
            {contratos.length === 0 ? (
              <Text c="#66756e" py="md">
                Este cliente ainda não possui contratos. A comissão é reconhecida por contrato,
                após o aporte conciliado.
              </Text>
            ) : (
              <Table.ScrollContainer minWidth={560}>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Contrato</Table.Th>
                      <Table.Th>Aporte</Table.Th>
                      <Table.Th>Início</Table.Th>
                      <Table.Th>Comissão/mês</Table.Th>
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
                        <Table.Td>{moeda(c.valorAporte)}</Table.Td>
                        <Table.Td>{data(c.dataInicio)}</Table.Td>
                        <Table.Td>{c.comissaoReconhecida ? moeda(c.comissaoMensalAtual) : '—'}</Table.Td>
                        <Table.Td>
                          <BadgeStatus status={c.statusRotulo} />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card>
            <Title order={3} fz="h4" mb="md">
              Histórico de interações
            </Title>
            {cliente.interacoes.length === 0 ? (
              <Text c="#66756e">Nenhuma interação registrada.</Text>
            ) : (
              <Timeline active={cliente.interacoes.length - 1} bulletSize={14} lineWidth={2} color="brand.8">
                {cliente.interacoes.map((i, idx) => (
                  <Timeline.Item key={idx} title={data(i.data)}>
                    <Text fz="sm" c="#22302b">
                      {i.descricao}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      <Stack mt="md" gap={2}>
        <Text fz="xs" c="#66756e">
          Você visualiza apenas os dados comerciais da sua carteira. Credenciais e conta de
          investidor do cliente não são acessíveis ao parceiro.
        </Text>
      </Stack>
    </>
  );
}

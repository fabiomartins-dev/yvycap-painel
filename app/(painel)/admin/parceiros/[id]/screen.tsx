'use client';

import { Badge, Card, Grid, SimpleGrid, Table, Text, Title } from '@mantine/core';
import { AnchorLink } from '@/components/AppLink';
import { data, mascararDocumento, moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { BadgeStatus } from '@/components/BadgeStatus';
import type { DetalheParceiroAdmin } from '@/services/admin';

export function ParceiroDetalheScreen({ det }: { det: DetalheParceiroAdmin }) {
  const { parceiro, contratos, comissoes } = det;

  return (
    <>
      <PageHeader
        titulo={parceiro.nome}
        descricao={parceiro.razaoSocial}
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Administração', href: '/admin' },
          { rotulo: 'Parceiros', href: '/admin/parceiros' },
          { rotulo: parceiro.nome },
        ]}
      />

      <SimpleGrid cols={{ base: 1, xs: 3 }} mb="md">
        <StatCard rotulo="Contratos originados" valor={String(contratos.length)} />
        <StatCard rotulo="Comissão paga" valor={moeda(det.totalComissaoPaga)} destaque />
        <StatCard rotulo="Comissão prevista" valor={moeda(det.totalComissaoPrevista)} />
      </SimpleGrid>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card>
            <Title order={3} fz="h4" mb="sm">
              Credenciamento
            </Title>
            <Table variant="vertical" layout="fixed">
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th w={140}>Situação</Table.Th>
                  <Table.Td>
                    <Badge size="xs" variant="filled" color={parceiro.ativo ? 'brand.7' : 'red'}>
                      {parceiro.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>CNPJ/CPF</Table.Th>
                  <Table.Td>{mascararDocumento(parceiro.cnpjCpf)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>E-mail</Table.Th>
                  <Table.Td>{parceiro.email}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Telefone</Table.Th>
                  <Table.Td>{parceiro.telefone}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Banco</Table.Th>
                  <Table.Td>
                    {parceiro.banco} · Ag. {parceiro.agencia} · Conta {parceiro.conta}
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>PIX</Table.Th>
                  <Table.Td>{parceiro.chavePix || '—'}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card>
            <Title order={3} fz="h4" mb="sm">
              Contratos originados
            </Title>
            {contratos.length === 0 ? (
              <Text c="#66756e">Nenhum contrato originado.</Text>
            ) : (
              <Table.ScrollContainer minWidth={520}>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Contrato</Table.Th>
                      <Table.Th>Investidor</Table.Th>
                      <Table.Th>Aporte</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {contratos.map((c) => (
                      <Table.Tr key={c.id}>
                        <Table.Td>
                          <AnchorLink href={`/admin/contratos/${c.id}`} fw={600} c="#124534">
                            {c.numero}
                          </AnchorLink>
                        </Table.Td>
                        <Table.Td>{c.investidorNome}</Table.Td>
                        <Table.Td>{moeda(c.valorAporte)}</Table.Td>
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

        <Grid.Col span={12}>
          <Card>
            <Title order={3} fz="h4" mb="sm">
              Extrato de comissões
            </Title>
            {comissoes.length === 0 ? (
              <Text c="#66756e">Nenhuma comissão reconhecida.</Text>
            ) : (
              <Table.ScrollContainer minWidth={720}>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Pagamento</Table.Th>
                      <Table.Th>Contrato</Table.Th>
                      <Table.Th>Tipo</Table.Th>
                      <Table.Th>Valor</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {comissoes.slice(0, 24).map((l, i) => (
                      <Table.Tr key={i}>
                        <Table.Td>{data(l.dataPagamento)}</Table.Td>
                        <Table.Td fw={600}>{l.contratoNumero}</Table.Td>
                        <Table.Td>
                          {l.tipo === 'entrada' ? 'Entrada (1%)' : l.tipo === 'recorrente' ? 'Recorrente (1% a.m.)' : 'Estorno'}
                        </Table.Td>
                        <Table.Td fw={600} c={l.valor < 0 ? 'red' : undefined}>
                          {moeda(l.valor)}
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
        </Grid.Col>
      </Grid>
    </>
  );
}

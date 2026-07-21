'use client';

import { Badge, Card, Grid, Group, Table, Text, Title } from '@mantine/core';
import { AnchorLink } from '@/components/AppLink';
import { acaoAprovarCadastroInvestidor, acaoConfirmarConciliacao } from '@/app/actions';
import { data, mascararDocumento, moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { BadgeStatus } from '@/components/BadgeStatus';
import { AcaoButton } from '@/components/admin/AcaoButton';
import type { DetalheInvestidorAdmin } from '@/services/admin';

export function InvestidorDetalheScreen({ det }: { det: DetalheInvestidorAdmin }) {
  const { investidor, contratos } = det;

  return (
    <>
      <PageHeader
        titulo={investidor.nome}
        descricao={`${investidor.email} · ${investidor.telefone}`}
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Administração', href: '/admin' },
          { rotulo: 'Investidores', href: '/admin/investidores' },
          { rotulo: investidor.nome },
        ]}
      />

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card>
            <Group justify="space-between" mb="sm">
              <Title order={3} fz="h4">
                Cadastro
              </Title>
              {!investidor.cadastroAprovado && (
                <AcaoButton
                  rotulo="Aprovar cadastro"
                  acao={acaoAprovarCadastroInvestidor.bind(null, investidor.id)}
                  mensagemSucesso="Cadastro aprovado."
                />
              )}
            </Group>
            <Table variant="vertical" layout="fixed">
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th w={150}>Situação</Table.Th>
                  <Table.Td>
                    <Badge size="xs" variant="filled" color={investidor.cadastroAprovado ? 'brand.7' : 'orange'}>
                      {investidor.cadastroAprovado ? 'Aprovado' : 'Em análise'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>CPF/CNPJ</Table.Th>
                  <Table.Td>{mascararDocumento(investidor.cpf)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Parceiro</Table.Th>
                  <Table.Td>{investidor.parceiroNome}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Total aportado</Table.Th>
                  <Table.Td fw={600}>{moeda(investidor.totalAportado)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Cliente desde</Table.Th>
                  <Table.Td>{data(investidor.criadoEm)}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card>
            <Title order={3} fz="h4" mb="sm">
              Contratos e conciliação
            </Title>
            {contratos.length === 0 ? (
              <Text c="#66756e">Nenhum contrato registrado.</Text>
            ) : (
              <Table.ScrollContainer minWidth={560}>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Contrato</Table.Th>
                      <Table.Th>Aporte</Table.Th>
                      <Table.Th>Início</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Ações</Table.Th>
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
                        <Table.Td>{moeda(c.valorAporte)}</Table.Td>
                        <Table.Td>{data(c.dataInicio)}</Table.Td>
                        <Table.Td>
                          <BadgeStatus status={c.statusRotulo} />
                        </Table.Td>
                        <Table.Td>
                          {!c.conciliado && !c.estornado && (
                            <AcaoButton
                              rotulo="Confirmar conciliação"
                              acao={acaoConfirmarConciliacao.bind(null, c.id)}
                              confirmacao={`Confirmar a conciliação do aporte de ${moeda(c.valorAporte)} do contrato ${c.numero}? A partir da conciliação a comissão do parceiro passa a ser reconhecida.`}
                              mensagemSucesso="Aporte conciliado."
                            />
                          )}
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

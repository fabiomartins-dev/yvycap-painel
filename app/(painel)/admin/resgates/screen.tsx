'use client';

import { Card, Group, Table, Text } from '@mantine/core';
import { acaoAprovarResgate, acaoRegistrarPagamentoResgate } from '@/app/actions';
import { data, moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { BadgeStatus } from '@/components/BadgeStatus';
import { AcaoButton } from '@/components/admin/AcaoButton';
import type { ResgateAdmin } from '@/services/admin';

export function ResgatesAdminScreen({ resgates }: { resgates: ResgateAdmin[] }) {
  return (
    <>
      <PageHeader
        titulo="Resgates"
        descricao="Fila de solicitações de resgate antecipado, com o prazo de 90 dias, aprovação e registro de pagamento."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Administração', href: '/admin' },
          { rotulo: 'Resgates' },
        ]}
      />
      <Card>
        {resgates.length === 0 ? (
          <Text c="#66756e" py="lg" ta="center">
            Nenhuma solicitação de resgate registrada.
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={860}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Contrato</Table.Th>
                  <Table.Th>Investidor</Table.Th>
                  <Table.Th>Parceiro</Table.Th>
                  <Table.Th>Aporte</Table.Th>
                  <Table.Th>Solicitado em</Table.Th>
                  <Table.Th>Liberação (90 dias)</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {resgates.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td fw={600}>{r.contratoNumero}</Table.Td>
                    <Table.Td>{r.investidorNome}</Table.Td>
                    <Table.Td>{r.parceiroNome}</Table.Td>
                    <Table.Td>{moeda(r.valorAporte)}</Table.Td>
                    <Table.Td>{data(r.dataSolicitacao)}</Table.Td>
                    <Table.Td>{data(r.dataLiberacao)}</Table.Td>
                    <Table.Td>
                      <BadgeStatus status={r.status} />
                      {r.pagoEm && (
                        <Text fz="xs" c="#66756e">
                          pago em {data(r.pagoEm)}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        {r.status === 'pendente' && (
                          <AcaoButton
                            rotulo="Aprovar"
                            acao={acaoAprovarResgate.bind(null, r.id)}
                            confirmacao={`Aprovar o resgate do contrato ${r.contratoNumero}? A liberação segue o prazo de 90 dias (${data(r.dataLiberacao)}).`}
                            mensagemSucesso="Resgate aprovado."
                          />
                        )}
                        {r.status === 'aprovado' && (
                          <AcaoButton
                            rotulo="Registrar pagamento"
                            color="gold.6"
                            acao={acaoRegistrarPagamentoResgate.bind(null, r.id)}
                            confirmacao={`Registrar o pagamento do resgate do contrato ${r.contratoNumero}? O contrato será quitado e o saldo ativo zerado.`}
                            mensagemSucesso="Pagamento registrado e contrato quitado."
                          />
                        )}
                      </Group>
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

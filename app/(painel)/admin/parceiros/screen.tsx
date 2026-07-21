'use client';

import { Badge, Card, Group, Table, Text } from '@mantine/core';
import { AnchorLink } from '@/components/AppLink';
import { acaoAlternarParceiroAtivo } from '@/app/actions';
import { data, mascararDocumento, moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { FormNovoParceiro } from '@/components/admin/FormNovoParceiro';
import { AcaoButton } from '@/components/admin/AcaoButton';
import type { ParceiroResumo } from '@/services/admin';

export function ParceirosScreen({ parceiros }: { parceiros: ParceiroResumo[] }) {
  return (
    <>
      <PageHeader
        titulo="Parceiros"
        descricao="Credenciamento e gestão dos parceiros da operação."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Administração', href: '/admin' },
          { rotulo: 'Parceiros' },
        ]}
      />
      <Card>
        <Group justify="flex-end" mb="md">
          <FormNovoParceiro />
        </Group>
        {parceiros.length === 0 ? (
          <Text c="#66756e" py="lg" ta="center">
            Nenhum parceiro credenciado ainda.
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={860}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Parceiro</Table.Th>
                  <Table.Th>CNPJ/CPF</Table.Th>
                  <Table.Th>Contratos</Table.Th>
                  <Table.Th>Saldo ativo da carteira</Table.Th>
                  <Table.Th>Credenciado em</Table.Th>
                  <Table.Th>Situação</Table.Th>
                  <Table.Th>Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {parceiros.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td>
                      <AnchorLink href={`/admin/parceiros/${p.id}`} fw={600} c="#124534">
                        {p.nome}
                      </AnchorLink>
                      <Text fz="xs" c="#66756e">
                        {p.razaoSocial}
                      </Text>
                    </Table.Td>
                    <Table.Td>{mascararDocumento(p.cnpjCpf)}</Table.Td>
                    <Table.Td>{p.contratos}</Table.Td>
                    <Table.Td>{moeda(p.saldoAtivoCarteira)}</Table.Td>
                    <Table.Td>{data(p.criadoEm)}</Table.Td>
                    <Table.Td>
                      <Badge size="xs" variant="filled" color={p.ativo ? 'brand.7' : 'red'}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <AcaoButton
                        rotulo={p.ativo ? 'Desativar' : 'Ativar'}
                        color={p.ativo ? 'red' : 'brand.7'}
                        acao={acaoAlternarParceiroAtivo.bind(null, p.id)}
                        confirmacao={
                          p.ativo
                            ? `Desativar ${p.nome}? O usuário de acesso também será desativado.`
                            : `Reativar ${p.nome}?`
                        }
                        mensagemSucesso="Situação do parceiro atualizada."
                      />
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

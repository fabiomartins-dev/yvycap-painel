'use client';

import { Badge, Card, Group, Table, Text } from '@mantine/core';
import { AnchorLink } from '@/components/AppLink';
import { acaoAprovarCadastroInvestidor } from '@/app/actions';
import { mascararDocumento, moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { AcaoButton } from '@/components/admin/AcaoButton';
import type { InvestidorAdmin } from '@/services/admin';

export function InvestidoresScreen({ investidores }: { investidores: InvestidorAdmin[] }) {
  return (
    <>
      <PageHeader
        titulo="Investidores"
        descricao="Todos os investidores da operação, com contratos, aportes e conciliação."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Administração', href: '/admin' },
          { rotulo: 'Investidores' },
        ]}
      />
      <Card>
        <Table.ScrollContainer minWidth={860}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Investidor</Table.Th>
                <Table.Th>CPF/CNPJ</Table.Th>
                <Table.Th>Parceiro</Table.Th>
                <Table.Th>Contratos</Table.Th>
                <Table.Th>Total aportado</Table.Th>
                <Table.Th>Cadastro</Table.Th>
                <Table.Th>Conciliação</Table.Th>
                <Table.Th>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {investidores.map((i) => (
                <Table.Tr key={i.id}>
                  <Table.Td>
                    <AnchorLink href={`/admin/investidores/${i.id}`} fw={600} c="#124534">
                      {i.nome}
                    </AnchorLink>
                    <Text fz="xs" c="#66756e">
                      {i.email}
                    </Text>
                  </Table.Td>
                  <Table.Td>{mascararDocumento(i.cpf)}</Table.Td>
                  <Table.Td>{i.parceiroNome}</Table.Td>
                  <Table.Td>{i.contratos}</Table.Td>
                  <Table.Td>{moeda(i.totalAportado)}</Table.Td>
                  <Table.Td>
                    <Badge size="xs" variant="filled" color={i.cadastroAprovado ? 'brand.7' : 'orange'}>
                      {i.cadastroAprovado ? 'Aprovado' : 'Em análise'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {i.pendenteConciliacao > 0 ? (
                      <Badge size="xs" variant="light" color="orange">
                        {i.pendenteConciliacao} pendente{i.pendenteConciliacao > 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <Badge size="xs" variant="filled" color="brand.7">
                        Em dia
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {!i.cadastroAprovado && (
                        <AcaoButton
                          rotulo="Aprovar cadastro"
                          acao={acaoAprovarCadastroInvestidor.bind(null, i.id)}
                          mensagemSucesso={`Cadastro de ${i.nome} aprovado.`}
                        />
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Text fz="xs" c="#66756e" mt="xs">
          Dados pessoais minimizados (LGPD). A conciliação de aportes é confirmada no detalhe do
          investidor ou na tela de contratos.
        </Text>
      </Card>
    </>
  );
}

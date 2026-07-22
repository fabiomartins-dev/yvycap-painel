'use client';

import { Badge, Card, Grid, Group, Stack, Table, Text, Title } from '@mantine/core';
import { data, mascararDocumento } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { SolicitarAlteracao } from '@/components/SolicitarAlteracao';
import type { Investidor, Parceiro, Permissao, UsuarioPublico } from '@/lib/types';

const ROTULO_PERMISSAO: Record<string, string> = {
  investidor: 'Investidor',
  parceiro: 'Parceiro',
  admin: 'Administrador',
};

export function PerfilScreen({
  usuario,
  permissoes,
  investidor,
  parceiro,
}: {
  usuario: UsuarioPublico;
  permissoes: Permissao[];
  investidor: Investidor | null;
  parceiro: Parceiro | null;
}) {
  const documento = investidor?.cpf ?? parceiro?.cnpjCpf ?? null;
  const telefone = investidor?.telefone ?? parceiro?.telefone ?? null;

  return (
    <>
      <PageHeader
        titulo="Perfil"
        descricao="Dados cadastrais, permissões da conta e canais oficiais da YVYCAP."
        migalhas={[{ rotulo: 'Painel', href: '/' }, { rotulo: 'Perfil' }]}
      />
      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card>
            <Group justify="space-between" mb="sm">
              <Title order={3} fz="h4">
                Dados cadastrais
              </Title>
              <SolicitarAlteracao
                dados={{
                  nome: usuario.nome,
                  email: usuario.email,
                  documento,
                  telefone,
                }}
              />
            </Group>
            <Table variant="vertical" layout="fixed">
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th w={160}>Nome</Table.Th>
                  <Table.Td>{usuario.nome}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>E-mail</Table.Th>
                  <Table.Td>{usuario.email}</Table.Td>
                </Table.Tr>
                {documento && (
                  <Table.Tr>
                    <Table.Th>CPF/CNPJ</Table.Th>
                    <Table.Td>{mascararDocumento(documento)}</Table.Td>
                  </Table.Tr>
                )}
                {telefone && (
                  <Table.Tr>
                    <Table.Th>Telefone</Table.Th>
                    <Table.Td>{telefone}</Table.Td>
                  </Table.Tr>
                )}
                <Table.Tr>
                  <Table.Th>Usuário desde</Table.Th>
                  <Table.Td>{data(usuario.criadoEm)}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <Card>
              <Title order={3} fz="h4" mb="sm">
                Permissões e termos
              </Title>
              <Group gap="xs" mb="sm">
                {permissoes.map((p) => (
                  <Badge key={p} variant="filled" color="brand.8">
                    {ROTULO_PERMISSAO[p]}
                  </Badge>
                ))}
              </Group>
              <Text fz="sm" c="#66756e">
                Termos de Uso e Privacidade dos Painéis:{' '}
                {usuario.termosAceitosEm
                  ? `aceitos em ${data(usuario.termosAceitosEm)}`
                  : 'pendentes de aceite'}
                .
              </Text>
            </Card>
            <Card>
              <Title order={3} fz="h4" mb="sm">
                Canais oficiais da YVYCAP
              </Title>
              <Stack gap={4} fz="sm">
                <Text fz="sm">E-mail: atendimento@yvycap.com.br</Text>
                <Text fz="sm">Telefone/WhatsApp: (11) 4000-0000 — dias úteis, 9h às 18h</Text>
                <Text fz="sm">Endereço: R. Francisco Zicardi, 519 · Jardim Anália Franco · São Paulo/SP</Text>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>

        {parceiro && (
          <Grid.Col span={12}>
            <Card>
              <Title order={3} fz="h4" mb="sm">
                Dados do credenciamento (parceiro)
              </Title>
              <Table variant="vertical" layout="fixed">
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Th w={200}>Razão social</Table.Th>
                    <Table.Td>{parceiro.razaoSocial}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>CNPJ/CPF</Table.Th>
                    <Table.Td>{mascararDocumento(parceiro.cnpjCpf)}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>Dados bancários</Table.Th>
                    <Table.Td>
                      {parceiro.banco} · Agência {parceiro.agencia} · Conta {parceiro.conta}
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>Chave PIX</Table.Th>
                    <Table.Td>{parceiro.chavePix}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>Credenciado em</Table.Th>
                    <Table.Td>{data(parceiro.criadoEm)}</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Card>
          </Grid.Col>
        )}
      </Grid>
      <Text fz="xs" c="#66756e" mt="lg">
        Aviso LGPD: seus dados pessoais são tratados pela YVYCAP exclusivamente para a gestão da
        operação e cumprimento de obrigações legais, nos termos da Lei nº 13.709/2018. Para exercer
        seus direitos como titular, utilize os canais oficiais acima.
      </Text>
    </>
  );
}

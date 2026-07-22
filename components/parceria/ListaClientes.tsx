'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ActionIcon, Anchor, Badge, Card, Table, Text, TextInput, Tooltip } from '@mantine/core';
import { data } from '@/lib/format';
import { ESTAGIOS_PIPELINE, type Cliente } from '@/lib/types';

function IconLapis() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

const COR_ESTAGIO: Record<string, string> = {
  identificado: 'gray',
  qualificado: 'blue',
  apresentado: 'cyan',
  documentacao: 'orange',
  aprovado: 'gold.6',
  contrato_assinado: 'brand.7',
  aporte_conciliado: 'brand.8',
};

export function rotuloEstagio(estagio: string): string {
  return ESTAGIOS_PIPELINE.find((e) => e.valor === estagio)?.rotulo ?? estagio;
}

export function BadgeEstagio({ estagio }: { estagio: string }) {
  return (
    <Badge color={COR_ESTAGIO[estagio] ?? 'gray'} variant="filled" size="sm">
      {rotuloEstagio(estagio)}
    </Badge>
  );
}

export function ListaClientes({ clientes }: { clientes: Cliente[] }) {
  const [busca, setBusca] = useState('');
  const filtrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Card>
      <TextInput
        placeholder="Buscar por nome ou e-mail…"
        value={busca}
        onChange={(e) => setBusca(e.currentTarget.value)}
        mb="md"
        maw={360}
        aria-label="Buscar cliente"
      />
      {filtrados.length === 0 ? (
        <Text c="#66756e" py="lg" ta="center">
          {clientes.length === 0
            ? 'Sua carteira ainda não tem clientes cadastrados.'
            : 'Nenhum cliente encontrado para a busca.'}
        </Text>
      ) : (
        <Table.ScrollContainer minWidth={640}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Contato</Table.Th>
                <Table.Th>Estágio do pipeline</Table.Th>
                <Table.Th>Desde</Table.Th>
                <Table.Th w={56} ta="right">Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtrados.map((c) => (
                <Table.Tr key={c.id}>
                  <Table.Td>
                    <Anchor component={Link} href={`/parceria/clientes/${c.id}`} fw={600} c="#124534">
                      {c.nome}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    <Text fz="sm">{c.email}</Text>
                    <Text fz="xs" c="#66756e">
                      {c.telefone}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <BadgeEstagio estagio={c.estagio} />
                  </Table.Td>
                  <Table.Td>{data(c.criadoEm)}</Table.Td>
                  <Table.Td ta="right">
                    <Tooltip label="Editar cliente" withArrow>
                      <ActionIcon
                        component={Link}
                        href={`/parceria/clientes/${c.id}/editar`}
                        variant="subtle"
                        color="brand.8"
                        aria-label={`Editar ${c.nome}`}
                      >
                        <IconLapis />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Card>
  );
}

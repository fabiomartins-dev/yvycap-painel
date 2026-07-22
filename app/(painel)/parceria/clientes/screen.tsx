'use client';

import { Group } from '@mantine/core';
import { PageHeader } from '@/components/PageHeader';
import { ButtonLink } from '@/components/AppLink';
import { ListaClientes } from '@/components/parceria/ListaClientes';
import type { Cliente } from '@/lib/types';

export function ClientesScreen({ clientes }: { clientes: Cliente[] }) {
  return (
    <>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <PageHeader
          titulo="Clientes"
          descricao="Sua carteira de clientes e o estágio de cada um no pipeline."
          migalhas={[
            { rotulo: 'Painel', href: '/' },
            { rotulo: 'Painel do Parceiro', href: '/parceria' },
            { rotulo: 'Clientes' },
          ]}
        />
        <ButtonLink href="/parceria/clientes/novo" color="gold.5" c="#0c352a" fw={600}>
          Novo cliente
        </ButtonLink>
      </Group>
      <ListaClientes clientes={clientes} />
    </>
  );
}

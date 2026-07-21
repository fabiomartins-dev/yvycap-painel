'use client';

import { PageHeader } from '@/components/PageHeader';
import { ListaClientes } from '@/components/parceria/ListaClientes';
import type { Cliente } from '@/lib/types';

export function ClientesScreen({ clientes }: { clientes: Cliente[] }) {
  return (
    <>
      <PageHeader
        titulo="Clientes"
        descricao="Sua carteira de clientes e o estágio de cada um no pipeline."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Parceria', href: '/parceria' },
          { rotulo: 'Clientes' },
        ]}
      />
      <ListaClientes clientes={clientes} />
    </>
  );
}

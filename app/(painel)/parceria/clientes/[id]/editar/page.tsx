import { notFound } from 'next/navigation';
import { exigirPermissao } from '@/lib/auth-server';
import { getDetalheCliente } from '@/services/parceria';
import { PageHeader } from '@/components/PageHeader';
import { ClienteForm } from '@/components/parceria/ClienteForm';

export const metadata = { title: 'Editar cliente' };

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sessao } = await exigirPermissao('parceiro');
  const det = await getDetalheCliente(sessao.userId, id);
  if (!det) notFound();

  return (
    <>
      <PageHeader
        titulo="Editar cliente"
        descricao={`Atualize os dados comerciais de ${det.cliente.nome}.`}
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Painel do Parceiro', href: '/parceria' },
          { rotulo: 'Clientes', href: '/parceria/clientes' },
          { rotulo: det.cliente.nome, href: `/parceria/clientes/${det.cliente.id}` },
          { rotulo: 'Editar' },
        ]}
      />
      <ClienteForm cliente={det.cliente} />
    </>
  );
}

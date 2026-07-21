import { notFound } from 'next/navigation';
import { exigirPermissao } from '@/lib/auth-server';
import { getDetalheCliente } from '@/services/parceria';
import { ClienteDetalheScreen } from './screen';

export const metadata = { title: 'Detalhe do cliente' };

export default async function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sessao } = await exigirPermissao('parceiro');
  const det = await getDetalheCliente(sessao.userId, id);
  if (!det) notFound();

  return <ClienteDetalheScreen det={det} />;
}

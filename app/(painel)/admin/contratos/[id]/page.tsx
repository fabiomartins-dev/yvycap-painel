import { notFound } from 'next/navigation';
import { exigirPermissao } from '@/lib/auth-server';
import { getContratoAdmin } from '@/services/admin';
import { ContratoAdminDetalheScreen } from './screen';

export const metadata = { title: 'Detalhe do contrato' };

export default async function ContratoAdminDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPermissao('admin');
  const contrato = await getContratoAdmin(id);
  if (!contrato) notFound();

  return <ContratoAdminDetalheScreen contrato={contrato} />;
}

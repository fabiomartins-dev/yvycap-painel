import { notFound } from 'next/navigation';
import { exigirPermissao } from '@/lib/auth-server';
import { getDetalheParceiro } from '@/services/admin';
import { ParceiroDetalheScreen } from './screen';

export const metadata = { title: 'Detalhe do parceiro' };

export default async function ParceiroDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPermissao('admin');
  const det = await getDetalheParceiro(id);
  if (!det) notFound();

  return <ParceiroDetalheScreen det={det} />;
}

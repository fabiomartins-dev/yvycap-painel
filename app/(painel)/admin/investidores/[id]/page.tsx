import { notFound } from 'next/navigation';
import { exigirPermissao } from '@/lib/auth-server';
import { getDetalheInvestidor } from '@/services/admin';
import { InvestidorDetalheScreen } from './screen';

export const metadata = { title: 'Detalhe do investidor' };

export default async function InvestidorDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirPermissao('admin');
  const det = await getDetalheInvestidor(id);
  if (!det) notFound();

  return <InvestidorDetalheScreen det={det} />;
}

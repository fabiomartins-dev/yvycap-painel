import { notFound } from 'next/navigation';
import { exigirPermissao } from '@/lib/auth-server';
import { getDetalheContrato } from '@/services/investimentos';
import { ContratoInvestidorScreen } from './screen';

export const metadata = { title: 'Detalhe do contrato' };

export default async function ContratoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sessao } = await exigirPermissao('investidor');
  const det = await getDetalheContrato(sessao.userId, id);
  if (!det) notFound();

  return <ContratoInvestidorScreen det={det} />;
}

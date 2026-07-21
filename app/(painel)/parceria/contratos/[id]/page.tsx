import { notFound } from 'next/navigation';
import { exigirPermissao } from '@/lib/auth-server';
import { getContratoCarteira } from '@/services/parceria';
import { ContratoParceriaScreen } from './screen';

export const metadata = { title: 'Detalhe do contrato' };

export default async function ContratoParceriaDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sessao } = await exigirPermissao('parceiro');
  const c = await getContratoCarteira(sessao.userId, id);
  if (!c) notFound();

  return <ContratoParceriaScreen contrato={c} />;
}

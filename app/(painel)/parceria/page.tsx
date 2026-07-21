import { exigirPermissao } from '@/lib/auth-server';
import { getResumoParceiro } from '@/services/parceria';
import { ParceriaScreen } from './screen';

export const metadata = { title: 'Parceria' };

export default async function ParceriaPage() {
  const { sessao } = await exigirPermissao('parceiro');
  const resumo = await getResumoParceiro(sessao.userId);

  return <ParceriaScreen resumo={resumo} />;
}

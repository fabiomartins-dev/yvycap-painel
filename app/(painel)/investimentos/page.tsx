import { exigirPermissao } from '@/lib/auth-server';
import { getResumoInvestidor } from '@/services/investimentos';
import { InvestimentosScreen } from './screen';

export const metadata = { title: 'Meus Investimentos' };

export default async function InvestimentosPage() {
  const { sessao } = await exigirPermissao('investidor');
  const resumo = await getResumoInvestidor(sessao.userId);

  return <InvestimentosScreen resumo={resumo} />;
}

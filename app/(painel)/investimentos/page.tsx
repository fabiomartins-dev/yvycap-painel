import { exigirPermissao } from '@/lib/auth-server';
import { getDetalheContrato, getResumoInvestidor } from '@/services/investimentos';
import { InvestimentosScreen } from './screen';
import type { CronogramaPorContrato } from '@/components/investimentos/DashboardInvestidor';

export const metadata = { title: 'Meus Investimentos' };

export default async function InvestimentosPage() {
  const { sessao } = await exigirPermissao('investidor');
  const resumo = await getResumoInvestidor(sessao.userId);

  const cronogramas: CronogramaPorContrato = {};
  await Promise.all(
    resumo.contratos.map(async (c) => {
      const det = await getDetalheContrato(sessao.userId, c.id);
      if (det) cronogramas[c.id] = det.cronograma;
    })
  );

  return <InvestimentosScreen resumo={resumo} cronogramas={cronogramas} />;
}

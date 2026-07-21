import { exigirPermissao } from '@/lib/auth-server';
import { getPagamentosInvestidor } from '@/services/investimentos';
import { PagamentosScreen } from './screen';

export const metadata = { title: 'Pagamentos' };

export default async function PagamentosPage() {
  const { sessao } = await exigirPermissao('investidor');
  const pagamentos = await getPagamentosInvestidor(sessao.userId);

  return <PagamentosScreen pagamentos={pagamentos} />;
}

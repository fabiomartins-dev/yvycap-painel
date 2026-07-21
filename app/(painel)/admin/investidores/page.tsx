import { exigirPermissao } from '@/lib/auth-server';
import { listarInvestidores } from '@/services/admin';
import { InvestidoresScreen } from './screen';

export const metadata = { title: 'Investidores' };

export default async function InvestidoresPage() {
  await exigirPermissao('admin');
  const investidores = await listarInvestidores();

  return <InvestidoresScreen investidores={investidores} />;
}

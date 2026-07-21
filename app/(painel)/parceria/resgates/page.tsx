import { exigirPermissao } from '@/lib/auth-server';
import { getResgatesCarteira } from '@/services/parceria';
import { ResgatesParceriaScreen } from './screen';

export const metadata = { title: 'Resgates' };

export default async function ResgatesParceriaPage() {
  const { sessao } = await exigirPermissao('parceiro');
  const resgates = await getResgatesCarteira(sessao.userId);

  return <ResgatesParceriaScreen resgates={resgates} />;
}

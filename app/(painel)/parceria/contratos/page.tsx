import { exigirPermissao } from '@/lib/auth-server';
import { getContratosCarteira } from '@/services/parceria';
import { ContratosParceriaScreen } from './screen';

export const metadata = { title: 'Contratos da carteira' };

export default async function ContratosParceriaPage() {
  const { sessao } = await exigirPermissao('parceiro');
  const contratos = await getContratosCarteira(sessao.userId);

  return <ContratosParceriaScreen contratos={contratos} />;
}

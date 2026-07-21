import { exigirPermissao } from '@/lib/auth-server';
import { getExtratoComissoes } from '@/services/parceria';
import { ComissoesScreen } from './screen';

export const metadata = { title: 'Comissões' };

export default async function ComissoesPage() {
  const { sessao } = await exigirPermissao('parceiro');
  const extrato = await getExtratoComissoes(sessao.userId);

  return <ComissoesScreen extrato={extrato} />;
}

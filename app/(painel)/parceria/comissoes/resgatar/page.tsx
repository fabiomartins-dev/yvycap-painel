import { exigirPermissao } from '@/lib/auth-server';
import { getExtratoComissoes } from '@/services/parceria';
import { PageHeader } from '@/components/PageHeader';
import { ResgateComissaoForm } from '@/components/parceria/ResgateComissaoForm';

export const metadata = { title: 'Solicitar resgate de comissão' };

export default async function ResgatarComissaoPage() {
  const { sessao } = await exigirPermissao('parceiro');
  const extrato = await getExtratoComissoes(sessao.userId);

  return (
    <>
      <PageHeader
        titulo="Solicitar resgate de comissão"
        descricao="Confirme o valor e valide a operação com sua senha e o código enviado por SMS."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Painel do Parceiro', href: '/parceria' },
          { rotulo: 'Comissões', href: '/parceria/comissoes' },
          { rotulo: 'Solicitar resgate' },
        ]}
      />
      <ResgateComissaoForm saldoDisponivel={extrato?.saldoDisponivel ?? 0} />
    </>
  );
}

import { exigirPermissao } from '@/lib/auth-server';
import { PageHeader } from '@/components/PageHeader';
import { ClienteForm } from '@/components/parceria/ClienteForm';

export const metadata = { title: 'Novo cliente' };

export default async function NovoClientePage() {
  await exigirPermissao('parceiro');

  return (
    <>
      <PageHeader
        titulo="Novo cliente"
        descricao="Cadastre um cliente na sua carteira e defina o estágio no pipeline."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Painel do Parceiro', href: '/parceria' },
          { rotulo: 'Clientes', href: '/parceria/clientes' },
          { rotulo: 'Novo cliente' },
        ]}
      />
      <ClienteForm />
    </>
  );
}

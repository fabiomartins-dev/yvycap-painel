import { exigirPermissao } from '@/lib/auth-server';
import { getClientes } from '@/services/parceria';
import { PageHeader } from '@/components/PageHeader';
import { ContratoForm } from '@/components/parceria/ContratoForm';

export const metadata = { title: 'Novo contrato' };

export default async function NovoContratoPage() {
  const { sessao } = await exigirPermissao('parceiro');
  const clientes = await getClientes(sessao.userId);

  return (
    <>
      <PageHeader
        titulo="Novo contrato"
        descricao="Origine um contrato para um cliente da sua carteira. A comissão é reconhecida após a conciliação do aporte."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Painel do Parceiro', href: '/parceria' },
          { rotulo: 'Contratos', href: '/parceria/contratos' },
          { rotulo: 'Novo contrato' },
        ]}
      />
      <ContratoForm clientes={clientes.map((c) => ({ id: c.id, nome: c.nome }))} />
    </>
  );
}

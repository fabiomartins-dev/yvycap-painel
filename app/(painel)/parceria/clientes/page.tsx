import { exigirPermissao } from '@/lib/auth-server';
import { getClientes } from '@/services/parceria';
import { ClientesScreen } from './screen';

export const metadata = { title: 'Clientes' };

export default async function ClientesPage() {
  const { sessao } = await exigirPermissao('parceiro');
  const clientes = await getClientes(sessao.userId);

  return <ClientesScreen clientes={clientes} />;
}

import { exigirPermissao } from '@/lib/auth-server';
import { listarContratos } from '@/services/admin';
import { ContratosAdminScreen } from './screen';

export const metadata = { title: 'Contratos' };

export default async function ContratosAdminPage() {
  await exigirPermissao('admin');
  const contratos = await listarContratos();

  return <ContratosAdminScreen contratos={contratos} />;
}

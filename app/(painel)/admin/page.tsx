import { exigirPermissao } from '@/lib/auth-server';
import { getResumoOperacao } from '@/services/admin';
import { AdminScreen } from './screen';

export const metadata = { title: 'Administração' };

export default async function AdminPage() {
  await exigirPermissao('admin');
  const resumo = await getResumoOperacao();

  return <AdminScreen resumo={resumo} />;
}

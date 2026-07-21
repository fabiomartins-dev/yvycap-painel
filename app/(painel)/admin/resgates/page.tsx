import { exigirPermissao } from '@/lib/auth-server';
import { listarResgates } from '@/services/admin';
import { ResgatesAdminScreen } from './screen';

export const metadata = { title: 'Resgates' };

export default async function ResgatesAdminPage() {
  await exigirPermissao('admin');
  const resgates = await listarResgates();

  return <ResgatesAdminScreen resgates={resgates} />;
}

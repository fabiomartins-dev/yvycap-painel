import { exigirPermissao } from '@/lib/auth-server';
import { listarParceiros } from '@/services/admin';
import { ParceirosScreen } from './screen';

export const metadata = { title: 'Parceiros' };

export default async function ParceirosPage() {
  await exigirPermissao('admin');
  const parceiros = await listarParceiros();

  return <ParceirosScreen parceiros={parceiros} />;
}

import { exigirPermissao } from '@/lib/auth-server';
import { comissoesConsolidadas } from '@/services/admin';
import { ComissoesAdminScreen } from './screen';

export const metadata = { title: 'Comissões' };

export default async function ComissoesAdminPage() {
  await exigirPermissao('admin');
  const linhas = await comissoesConsolidadas();

  return <ComissoesAdminScreen linhas={linhas} />;
}

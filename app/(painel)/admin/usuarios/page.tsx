import { exigirPermissao } from '@/lib/auth-server';
import { listarUsuarios } from '@/services/admin';
import { UsuariosScreen } from './screen';

export const metadata = { title: 'Usuários e permissões' };

export default async function UsuariosPage() {
  await exigirPermissao('admin');
  const usuarios = await listarUsuarios();

  return <UsuariosScreen usuarios={usuarios} />;
}

'use client';

import { PageHeader } from '@/components/PageHeader';
import { UsuariosAdmin } from '@/components/admin/UsuariosAdmin';
import type { UsuarioPublico } from '@/lib/types';

export function UsuariosScreen({ usuarios }: { usuarios: UsuarioPublico[] }) {
  return (
    <>
      <PageHeader
        titulo="Usuários e permissões"
        descricao="Crie e edite usuários, atribua qualquer combinação de permissões e faça reset de acesso."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Administração', href: '/admin' },
          { rotulo: 'Usuários e permissões' },
        ]}
      />
      <UsuariosAdmin usuarios={usuarios} />
    </>
  );
}

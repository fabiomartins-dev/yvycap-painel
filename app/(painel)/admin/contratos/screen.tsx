'use client';

import { PageHeader } from '@/components/PageHeader';
import { ContratosAdmin } from '@/components/admin/ContratosAdmin';
import type { ContratoAdmin } from '@/services/admin';

export function ContratosAdminScreen({ contratos }: { contratos: ContratoAdmin[] }) {
  return (
    <>
      <PageHeader
        titulo="Contratos"
        descricao="Todos os contratos da operação, com filtros por fase, parceiro e status."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Administração', href: '/admin' },
          { rotulo: 'Contratos' },
        ]}
      />
      <ContratosAdmin contratos={contratos} />
    </>
  );
}

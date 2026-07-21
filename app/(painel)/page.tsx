import { redirect } from 'next/navigation';
import { exigirSessao } from '@/lib/auth-server';
import { getResumoInvestidor } from '@/services/investimentos';
import { getResumoParceiro } from '@/services/parceria';
import { getResumoOperacao } from '@/services/admin';
import { HomeScreen } from './screen';

const HOME_POR_PERMISSAO = {
  investidor: '/investimentos',
  parceiro: '/parceria',
  admin: '/admin',
} as const;

export default async function HomePage() {
  const { usuario, sessao } = await exigirSessao();
  const permissoes = sessao.permissoes;

  // Uma permissão só → vai direto para a seção correspondente
  if (permissoes.length === 1) redirect(HOME_POR_PERMISSAO[permissoes[0]]);

  const [inv, par, adm] = await Promise.all([
    permissoes.includes('investidor') ? getResumoInvestidor(sessao.userId) : null,
    permissoes.includes('parceiro') ? getResumoParceiro(sessao.userId) : null,
    permissoes.includes('admin') ? getResumoOperacao() : null,
  ]);

  return <HomeScreen primeiroNome={usuario.nome.split(' ')[0]} inv={inv} par={par} adm={adm} />;
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppShell, Badge, Box, Burger, Container, Group, NavLink, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Logo } from './Logo';
import { Rodape } from './Rodape';
import { SessionBanner } from './SessionBanner';
import type { Permissao } from '@/lib/types';

interface ItemNav {
  rotulo: string;
  href: string;
  exato?: boolean;
}

interface GrupoNav {
  titulo: string;
  permissao: Permissao | null;
  itens: ItemNav[];
}

const GRUPOS: GrupoNav[] = [
  {
    titulo: 'Meus Investimentos',
    permissao: 'investidor',
    itens: [
      { rotulo: 'Meus investimentos', href: '/investimentos', exato: true },
      { rotulo: 'Pagamentos', href: '/investimentos/pagamentos' },
    ],
  },
  {
    titulo: 'Parceria',
    permissao: 'parceiro',
    itens: [
      { rotulo: 'Dashboard', href: '/parceria', exato: true },
      { rotulo: 'Clientes', href: '/parceria/clientes' },
      { rotulo: 'Contratos', href: '/parceria/contratos' },
      { rotulo: 'Comissões', href: '/parceria/comissoes' },
      { rotulo: 'Resgates', href: '/parceria/resgates' },
    ],
  },
  {
    titulo: 'Administração',
    permissao: 'admin',
    itens: [
      { rotulo: 'Dashboard', href: '/admin', exato: true },
      { rotulo: 'Parceiros', href: '/admin/parceiros' },
      { rotulo: 'Investidores', href: '/admin/investidores' },
      { rotulo: 'Contratos', href: '/admin/contratos' },
      { rotulo: 'Comissões', href: '/admin/comissoes' },
      { rotulo: 'Resgates', href: '/admin/resgates' },
      { rotulo: 'Usuários e permissões', href: '/admin/usuarios' },
    ],
  },
];

const ROTULO_PERMISSAO: Record<Permissao, string> = {
  investidor: 'Investidor',
  parceiro: 'Parceiro',
  admin: 'Administrador',
};

export function PainelShell({
  nome,
  permissoes,
  exp,
  children,
}: {
  nome: string;
  permissoes: Permissao[];
  exp: number;
  children: React.ReactNode;
}) {
  const [aberto, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();

  const grupos = GRUPOS.filter((g) => !g.permissao || permissoes.includes(g.permissao));

  function ativo(item: ItemNav): boolean {
    return item.exato ? pathname === item.href : pathname.startsWith(item.href);
  }

  return (
    <AppShell
      header={{ height: 100 }}
      navbar={{ width: 264, breakpoint: 'sm', collapsed: { mobile: !aberto } }}
      padding="md"
      styles={{
        main: { backgroundColor: '#f6f3ec' },
        navbar: { backgroundColor: '#fffdf8', borderColor: '#e5decf' },
      }}
    >
      <AppShell.Header style={{ border: 0 }}>
        <SessionBanner exp={exp} />
        <Group h={68} px="md" bg="#0c352a" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={aberto}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              color="#dbba76"
              aria-label="Abrir navegação"
            />
            <Link href="/" style={{ textDecoration: 'none' }} aria-label="Home do painel">
              <Logo />
            </Link>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Box visibleFrom="xs" ta="right">
              <Text c="white" fz="sm" fw={600} lh={1.2}>
                {nome}
              </Text>
              <Group gap={4} justify="flex-end">
                {permissoes.map((p) => (
                  <Badge key={p} size="xs" variant="light" color="gold.3" c="#dbba76" bg="rgba(200,164,94,0.15)">
                    {ROTULO_PERMISSAO[p]}
                  </Badge>
                ))}
              </Group>
            </Box>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="lg">
          {grupos.map((g) => (
            <Box key={g.titulo}>
              <Text fz="xs" fw={700} c="#66756e" tt="uppercase" mb={4} style={{ letterSpacing: '0.08em' }}>
                {g.titulo}
              </Text>
              {g.itens.map((item) => (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.rotulo}
                  active={ativo(item)}
                  variant={ativo(item) ? 'filled' : 'subtle'}
                  color="brand.9"
                  onClick={close}
                  style={{ borderRadius: 8 }}
                />
              ))}
            </Box>
          ))}
          <Box>
            <Text fz="xs" fw={700} c="#66756e" tt="uppercase" mb={4} style={{ letterSpacing: '0.08em' }}>
              Conta
            </Text>
            <NavLink
              component={Link}
              href="/perfil"
              label="Perfil"
              active={pathname.startsWith('/perfil')}
              variant={pathname.startsWith('/perfil') ? 'filled' : 'subtle'}
              color="brand.9"
              onClick={close}
              style={{ borderRadius: 8 }}
            />
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl" px={0} style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 132px)' }}>
          <Box style={{ flex: 1 }}>{children}</Box>
          <Rodape />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

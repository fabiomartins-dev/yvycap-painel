'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Alert,
  Anchor,
  Box,
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const form = useForm({
    initialValues: { email: '', senha: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Informe um e-mail válido'),
      senha: (v) => (v.length > 0 ? null : 'Informe a senha'),
    },
  });

  async function entrar(values: typeof form.values) {
    setErro(null);
    setCarregando(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const body = await res.json();
      if (!res.ok) {
        setErro(body.erro ?? 'Não foi possível entrar. Tente novamente.');
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setErro('Falha de comunicação. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Box mih="100dvh" bg="#0c352a" py="xl">
      <Center mih="90dvh" px="md">
        <Stack w="100%" maw={420} gap="lg">
          <Center>
            <Logo tamanho={30} />
          </Center>
          <Card padding="xl">
            <Stack gap="md">
              <Box>
                <Title order={2} fz="h3">
                  Acessar o painel
                </Title>
                <Text c="#66756e" fz="sm">
                  Acompanhamento da captação privada por contratos de mútuo.
                </Text>
              </Box>
              {erro && (
                <Alert color="red" variant="light" title="Acesso não autorizado">
                  {erro}
                </Alert>
              )}
              <form onSubmit={form.onSubmit(entrar)}>
                <Stack gap="sm">
                  <TextInput
                    label="E-mail"
                    placeholder="seu@email.com"
                    autoComplete="username"
                    {...form.getInputProps('email')}
                  />
                  <PasswordInput
                    label="Senha"
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    {...form.getInputProps('senha')}
                  />
                  <Button type="submit" loading={carregando} fullWidth mt="xs" color="gold.5" c="#0c352a" fw={600}>
                    Entrar
                  </Button>
                </Stack>
              </form>
              <Anchor component={Link} href="/esqueci-senha" fz="sm" c="#1b5c46">
                Esqueci minha senha
              </Anchor>
            </Stack>
          </Card>
          <Text c="rgba(255,255,255,0.55)" fz="xs" ta="center">
            Ambiente de demonstração — usuários de teste: investidor@teste.com, parceiro@teste.com,
            investidor.parceiro@teste.com, admin@teste.com (senha: yvycap2026)
          </Text>
        </Stack>
      </Center>
    </Box>
  );
}

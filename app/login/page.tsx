'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  PasswordInput,
  PinInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Logo } from '@/components/Logo';

// Token mockado enviado por SMS (integração real será feita depois).
const TOKEN_MOCK = '123456';

function mascararTelefone(email: string) {
  return '(••) •••••-••' + String(email.length % 100).padStart(2, '0');
}

export default function LoginPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [etapa, setEtapa] = useState<'credenciais' | 'token'>('credenciais');
  const [token, setToken] = useState('');

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
      // Login validado — enviamos o token por SMS (mock) e pedimos a verificação.
      setToken('');
      setEtapa('token');
    } catch {
      setErro('Falha de comunicação. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  function verificarToken() {
    setErro(null);
    if (token !== TOKEN_MOCK) {
      setErro('Token inválido. Confira o código enviado por SMS e tente novamente.');
      return;
    }
    setCarregando(true);
    router.push('/');
    router.refresh();
  }

  function voltar() {
    setEtapa('credenciais');
    setErro(null);
    setToken('');
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
                  {etapa === 'credenciais' ? 'Acessar o painel' : 'Verificação em duas etapas'}
                </Title>
                <Text c="#66756e" fz="sm">
                  {etapa === 'credenciais'
                    ? 'Acompanhamento da captação privada por contratos de mútuo.'
                    : `Enviamos um código de 6 dígitos por SMS para o número ${mascararTelefone(
                        form.values.email
                      )}.`}
                </Text>
              </Box>
              {erro && (
                <Alert color="red" variant="light" title="Acesso não autorizado">
                  {erro}
                </Alert>
              )}
              {etapa === 'credenciais' ? (
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
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    verificarToken();
                  }}
                >
                  <Stack gap="sm">
                    <Stack gap={4}>
                      <Text fz="sm" fw={500}>
                        Código de verificação
                      </Text>
                      <Center>
                        <PinInput
                          length={6}
                          type="number"
                          oneTimeCode
                          value={token}
                          onChange={setToken}
                          onComplete={verificarToken}
                        />
                      </Center>
                    </Stack>
                    <Text fz="xs" c="#66756e" ta="center">
                      Ambiente de teste: use o código {TOKEN_MOCK}.
                    </Text>
                    <Button
                      type="submit"
                      loading={carregando}
                      disabled={token.length < 6}
                      fullWidth
                      mt="xs"
                      color="gold.5"
                      c="#0c352a"
                      fw={600}
                    >
                      Verificar e entrar
                    </Button>
                    <Button variant="subtle" color="gray" size="compact-sm" onClick={voltar}>
                      Voltar
                    </Button>
                  </Stack>
                </form>
              )}
            </Stack>
          </Card>
        </Stack>
      </Center>
    </Box>
  );
}

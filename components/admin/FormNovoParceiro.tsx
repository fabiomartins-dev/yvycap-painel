'use client';

import { useState, useTransition } from 'react';
import { Button, Divider, Grid, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { acaoCadastrarParceiro } from '@/app/actions';

export function FormNovoParceiro() {
  const [aberto, setAberto] = useState(false);
  const [pendente, startTransition] = useTransition();

  const form = useForm({
    initialValues: {
      nome: '',
      razaoSocial: '',
      cnpjCpf: '',
      email: '',
      telefone: '',
      banco: '',
      agencia: '',
      conta: '',
      chavePix: '',
    },
    validate: {
      nome: (v) => (v.trim().length >= 3 ? null : 'Informe o nome completo'),
      razaoSocial: (v) => (v.trim().length >= 3 ? null : 'Informe a razão social'),
      cnpjCpf: (v) => (v.replace(/\D/g, '').length >= 11 ? null : 'Informe CNPJ ou CPF válido'),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'E-mail inválido'),
      telefone: (v) => (v.trim().length >= 8 ? null : 'Informe o telefone'),
      banco: (v) => (v.trim() ? null : 'Obrigatório'),
      agencia: (v) => (v.trim() ? null : 'Obrigatório'),
      conta: (v) => (v.trim() ? null : 'Obrigatório'),
    },
  });

  function enviar(values: typeof form.values) {
    startTransition(async () => {
      await acaoCadastrarParceiro(values);
      setAberto(false);
      form.reset();
      notifications.show({
        title: 'Parceiro cadastrado',
        message: `Usuário criado para ${values.nome} com a permissão de parceiro. Credenciais são enviadas pelos canais oficiais.`,
        color: 'green',
      });
    });
  }

  return (
    <>
      <Button color="gold.5" c="#0c352a" fw={600} onClick={() => setAberto(true)}>
        Cadastrar parceiro
      </Button>
      <Modal opened={aberto} onClose={() => setAberto(false)} title="Cadastrar novo parceiro" size="lg" centered>
        <form onSubmit={form.onSubmit(enviar)}>
          <Stack gap="sm">
            <Text fz="xs" c="#66756e">
              O credenciamento cria também o usuário de acesso ao painel com a permissão de
              parceiro.
            </Text>
            <Divider label="Dados cadastrais" labelPosition="left" />
            <Grid gap="sm">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="Nome do responsável" {...form.getInputProps('nome')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="Razão social" {...form.getInputProps('razaoSocial')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="CNPJ/CPF" placeholder="00.000.000/0000-00" {...form.getInputProps('cnpjCpf')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="Telefone" {...form.getInputProps('telefone')} />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput label="E-mail (login do usuário)" {...form.getInputProps('email')} />
              </Grid.Col>
            </Grid>
            <Divider label="Dados bancários" labelPosition="left" />
            <Grid gap="sm">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="Banco" placeholder="Ex.: Itaú (341)" {...form.getInputProps('banco')} />
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <TextInput label="Agência" {...form.getInputProps('agencia')} />
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <TextInput label="Conta" {...form.getInputProps('conta')} />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput label="Chave PIX (opcional)" {...form.getInputProps('chavePix')} />
              </Grid.Col>
            </Grid>
            <Button type="submit" loading={pendente} color="gold.5" c="#0c352a" fw={600} mt="xs">
              Cadastrar parceiro e criar usuário
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}

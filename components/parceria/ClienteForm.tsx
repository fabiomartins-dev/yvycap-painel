'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Grid, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { ButtonLink } from '@/components/AppLink';
import { acaoAtualizarCliente, acaoCriarCliente } from '@/app/actions';
import { ESTAGIOS_PIPELINE, type Cliente, type EstagioPipeline } from '@/lib/types';

const OPCOES_ESTAGIO = ESTAGIOS_PIPELINE.map((e) => ({ value: e.valor, label: e.rotulo }));

export function ClienteForm({ cliente }: { cliente?: Cliente }) {
  const router = useRouter();
  const edicao = !!cliente;
  const [pendente, startTransition] = useTransition();

  const form = useForm({
    initialValues: {
      nome: cliente?.nome ?? '',
      email: cliente?.email ?? '',
      telefone: cliente?.telefone ?? '',
      estagio: (cliente?.estagio ?? 'identificado') as EstagioPipeline,
    },
    validate: {
      nome: (v) => (v.trim().length >= 3 ? null : 'Informe o nome completo'),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'E-mail inválido'),
      telefone: (v) => (v.trim().length >= 8 ? null : 'Informe o telefone'),
    },
  });

  const destino = edicao ? `/parceria/clientes/${cliente!.id}` : '/parceria/clientes';

  function enviar(values: typeof form.values) {
    startTransition(async () => {
      const r = edicao
        ? await acaoAtualizarCliente(cliente!.id, values)
        : await acaoCriarCliente(values);
      if (r.ok) {
        notifications.show({
          title: edicao ? 'Cliente atualizado' : 'Cliente cadastrado',
          message: edicao
            ? `Os dados de ${values.nome} foram atualizados.`
            : `${values.nome} foi adicionado à sua carteira.`,
          color: 'green',
        });
        router.push(destino);
        router.refresh();
      } else {
        notifications.show({
          title: 'Não foi possível salvar',
          message: 'Verifique os dados e tente novamente.',
          color: 'red',
        });
      }
    });
  }

  return (
    <Card maw={640}>
      <form onSubmit={form.onSubmit(enviar)}>
        <Stack gap="sm">
          <Text fz="xs" c="#66756e">
            Você gerencia apenas os dados comerciais do cliente na sua carteira. Credenciais e conta
            de investidor não são acessíveis ao parceiro.
          </Text>
          <Grid gap="sm">
            <Grid.Col span={12}>
              <TextInput label="Nome completo" {...form.getInputProps('nome')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 7 }}>
              <TextInput label="E-mail" {...form.getInputProps('email')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 5 }}>
              <TextInput label="Telefone" placeholder="(11) 90000-0000" {...form.getInputProps('telefone')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Estágio do pipeline"
                data={OPCOES_ESTAGIO}
                allowDeselect={false}
                {...form.getInputProps('estagio')}
              />
            </Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="xs">
            <ButtonLink href={destino} variant="default">
              Cancelar
            </ButtonLink>
            <Button type="submit" loading={pendente} color="gold.5" c="#0c352a" fw={600}>
              {edicao ? 'Salvar alterações' : 'Cadastrar cliente'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}

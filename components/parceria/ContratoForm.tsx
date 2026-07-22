'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Group, NumberInput, Select, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { ButtonLink } from '@/components/AppLink';
import { acaoCriarContrato } from '@/app/actions';
import { APORTE_MINIMO, FASES } from '@/lib/calc';
import { moeda, percentualMes } from '@/lib/format';

export interface OpcaoCliente {
  id: string;
  nome: string;
}

const OPCOES_FASE = FASES.map((f) => ({
  value: String(f.numero),
  label: `Fase ${f.numero} · ${percentualMes(f.taxaMensal)}`,
}));

export function ContratoForm({ clientes }: { clientes: OpcaoCliente[] }) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();

  const form = useForm({
    initialValues: {
      clienteId: '',
      valorAporte: APORTE_MINIMO,
      fase: '1',
    },
    validate: {
      clienteId: (v) => (v ? null : 'Selecione o cliente'),
      valorAporte: (v) =>
        typeof v === 'number' && v >= APORTE_MINIMO ? null : `Aporte mínimo de ${moeda(APORTE_MINIMO)}`,
    },
  });

  function enviar(values: typeof form.values) {
    startTransition(async () => {
      const r = await acaoCriarContrato({
        clienteId: values.clienteId,
        valorAporte: Number(values.valorAporte),
        fase: Number(values.fase) as 1 | 2 | 3,
      });
      if (r.ok) {
        notifications.show({
          title: 'Contrato originado',
          message: 'O contrato foi criado e está aguardando a conciliação do aporte pela YVYCAP.',
          color: 'green',
        });
        router.push('/parceria/contratos');
        router.refresh();
      } else {
        notifications.show({
          title: 'Não foi possível criar o contrato',
          message: 'Verifique o cliente selecionado e o valor do aporte.',
          color: 'red',
        });
      }
    });
  }

  if (clientes.length === 0) {
    return (
      <Card maw={640}>
        <Stack gap="sm">
          <Alert color="orange" variant="light">
            Cadastre um cliente na sua carteira antes de originar um contrato.
          </Alert>
          <Group>
            <ButtonLink href="/parceria/clientes/novo" color="gold.5" c="#0c352a" fw={600}>
              Cadastrar cliente
            </ButtonLink>
            <ButtonLink href="/parceria/contratos" variant="default">
              Voltar
            </ButtonLink>
          </Group>
        </Stack>
      </Card>
    );
  }

  return (
    <Card maw={640}>
      <form onSubmit={form.onSubmit(enviar)}>
        <Stack gap="sm">
          <Text fz="xs" c="#66756e">
            O contrato é originado como <b>Aguardando conciliação</b>. A comissão só é reconhecida
            após a YVYCAP conciliar o aporte.
          </Text>
          <Select
            label="Cliente"
            placeholder="Selecione o cliente"
            searchable
            allowDeselect={false}
            data={clientes.map((c) => ({ value: c.id, label: c.nome }))}
            {...form.getInputProps('clienteId')}
          />
          <NumberInput
            label="Valor do aporte"
            prefix="R$ "
            thousandSeparator="."
            decimalSeparator=","
            min={APORTE_MINIMO}
            step={10_000}
            allowNegative={false}
            {...form.getInputProps('valorAporte')}
          />
          <Select label="Fase" data={OPCOES_FASE} allowDeselect={false} {...form.getInputProps('fase')} />
          <Group justify="flex-end" mt="xs">
            <ButtonLink href="/parceria/contratos" variant="default">
              Cancelar
            </ButtonLink>
            <Button type="submit" loading={pendente} color="gold.5" c="#0c352a" fw={600}>
              Originar contrato
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}

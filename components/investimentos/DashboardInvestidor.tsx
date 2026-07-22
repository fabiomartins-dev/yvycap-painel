'use client';

import Link from 'next/link';
import { Anchor, Button, Card, Divider, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { BadgeStatus } from '@/components/BadgeStatus';
import { data, moeda, percentualMes } from '@/lib/format';
import type { ContratoInvestidor } from '@/services/investimentos';

function LinhaInfo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <Group justify="space-between" gap="xs" wrap="nowrap">
      <Text fz="sm" c="#66756e">
        {rotulo}
      </Text>
      <Text fz="sm" fw={500} ta="right">
        {valor}
      </Text>
    </Group>
  );
}

export function DashboardInvestidor({ contratos }: { contratos: ContratoInvestidor[] }) {
  return (
    <Stack gap="sm" mt="md">
      <Title order={3} fz="h4">
        Contratos
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {contratos.map((c) => (
          <Card key={c.id} withBorder padding="md">
            <Stack gap="sm" h="100%">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2}>
                  <Anchor
                    component={Link}
                    href={`/investimentos/contratos/${c.id}`}
                    fw={600}
                    fz="lg"
                    c="#124534"
                  >
                    {c.numero}
                  </Anchor>
                  <Text fz="xs" c="#66756e">
                    Fase {c.fase}
                  </Text>
                </Stack>
                <BadgeStatus status={c.statusRotulo} />
              </Group>

              <Divider />

              <Stack gap={6}>
                <LinhaInfo rotulo="Valor aportado" valor={moeda(c.valorAporte)} />
                <LinhaInfo rotulo="Taxa" valor={percentualMes(c.taxaMensal)} />
                <LinhaInfo rotulo="Início" valor={data(c.dataInicio)} />
                <LinhaInfo rotulo="Vencimento" valor={data(c.dataVencimento)} />
              </Stack>

              <Button
                component={Link}
                href={`/investimentos/contratos/${c.id}`}
                variant="filled"
                color="brand.7"
                c="white"
                mt="auto"
                fullWidth
                rightSection={
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                }
              >
                Ver detalhe
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
      <Text fz="xs" c="#66756e">
        Clique em “Ver detalhe” para abrir a tela completa do contrato, com cronograma e documentos.
      </Text>
    </Stack>
  );
}

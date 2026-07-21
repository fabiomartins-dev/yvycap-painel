'use client';

import { Card, Grid, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { ButtonLink } from '@/components/AppLink';
import { data, moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import type { ResumoInvestidor } from '@/services/investimentos';
import type { ResumoParceiro } from '@/services/parceria';
import type { ResumoOperacao } from '@/services/admin';

export function HomeScreen({
  primeiroNome,
  inv,
  par,
  adm,
}: {
  primeiroNome: string;
  inv: ResumoInvestidor | null;
  par: ResumoParceiro | null;
  adm: ResumoOperacao | null;
}) {
  return (
    <>
      <PageHeader
        titulo={`Bem-vindo, ${primeiroNome}`}
        descricao="Resumo das seções a que você tem acesso no painel."
      />
      <Grid gap="md">
        {inv && (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card h="100%">
              <Stack gap="md" h="100%">
                <Group justify="space-between">
                  <Title order={3} fz="h4">
                    Meus Investimentos
                  </Title>
                  <ButtonLink href="/investimentos" size="xs" variant="light" color="brand.8">
                    Abrir seção
                  </ButtonLink>
                </Group>
                <SimpleGrid cols={2}>
                  <StatCard rotulo="Total aportado" valor={moeda(inv.totalAportado)} />
                  <StatCard rotulo="Contratos ativos" valor={String(inv.contratosAtivos)} />
                  <StatCard
                    rotulo="Próximo pagamento"
                    valor={inv.proximoPagamento ? moeda(inv.proximoPagamento.valor) : '—'}
                    detalhe={inv.proximoPagamento ? `em ${data(inv.proximoPagamento.data)}` : 'Sem pagamentos previstos'}
                  />
                  <StatCard rotulo="Total já recebido" valor={moeda(inv.totalRecebido)} />
                </SimpleGrid>
              </Stack>
            </Card>
          </Grid.Col>
        )}
        {par && (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card h="100%">
              <Stack gap="md" h="100%">
                <Group justify="space-between">
                  <Title order={3} fz="h4">
                    Parceria
                  </Title>
                  <ButtonLink href="/parceria" size="xs" variant="light" color="brand.8">
                    Abrir seção
                  </ButtonLink>
                </Group>
                <SimpleGrid cols={2}>
                  <StatCard rotulo="Saldo ativo da carteira" valor={moeda(par.saldoAtivoCarteira)} />
                  <StatCard rotulo="Contratos ativos" valor={String(par.contratosAtivos)} />
                  <StatCard rotulo="Comissão do mês" valor={moeda(par.comissaoDoMes)} />
                  <StatCard rotulo="Comissão acumulada" valor={moeda(par.comissaoAcumulada)} />
                </SimpleGrid>
              </Stack>
            </Card>
          </Grid.Col>
        )}
        {adm && (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card h="100%">
              <Stack gap="md" h="100%">
                <Group justify="space-between">
                  <Title order={3} fz="h4">
                    Administração
                  </Title>
                  <ButtonLink href="/admin" size="xs" variant="light" color="brand.8">
                    Abrir seção
                  </ButtonLink>
                </Group>
                <SimpleGrid cols={2}>
                  <StatCard rotulo="Total captado" valor={moeda(adm.totalCaptado)} detalhe={`Meta da fase: ${moeda(adm.metaFase)}`} />
                  <StatCard rotulo="Contratos ativos" valor={String(adm.contratosAtivos)} />
                  <StatCard rotulo="Comissões a pagar no mês" valor={moeda(adm.comissoesAPagarMes)} />
                  <StatCard rotulo="Resgates pendentes" valor={String(adm.resgatesPendentes)} />
                </SimpleGrid>
              </Stack>
            </Card>
          </Grid.Col>
        )}
      </Grid>
      <Text fz="xs" c="#66756e" mt="lg">
        Os valores exibidos são calculados a partir dos contratos registrados. Em caso de
        divergência, prevalecem o contrato assinado e os registros oficiais da YVYCAP.
      </Text>
    </>
  );
}

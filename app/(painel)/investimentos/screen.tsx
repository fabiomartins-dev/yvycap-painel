'use client';

import { Card, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { data, moeda } from '@/lib/format';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DashboardInvestidor } from '@/components/investimentos/DashboardInvestidor';
import type { ResumoInvestidor } from '@/services/investimentos';

export function InvestimentosScreen({ resumo }: { resumo: ResumoInvestidor }) {
  return (
    <>
      <PageHeader
        titulo="Meus Investimentos"
        descricao="Acompanhe seus contratos, valores aportados e pagamentos."
        migalhas={[{ rotulo: 'Painel', href: '/' }, { rotulo: 'Meus Investimentos' }]}
      />

      {resumo.contratos.length === 0 ? (
        <Card padding="xl">
          <Stack align="center" gap="xs" py="lg">
            <Title order={3} fz="h4">
              Você ainda não possui contratos ativos
            </Title>
            <Text c="#66756e" ta="center" maw={480}>
              Assim que seu contrato de mútuo for assinado e o aporte conciliado pela YVYCAP, ele
              aparecerá aqui com o cronograma completo de pagamentos. Em caso de dúvida, fale com os
              canais oficiais da YVYCAP.
            </Text>
          </Stack>
        </Card>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
            <StatCard rotulo="Total aportado" valor={moeda(resumo.totalAportado)} destaque />
            <StatCard rotulo="Contratos ativos" valor={String(resumo.contratosAtivos)} />
            <StatCard
              rotulo="Próximo pagamento"
              valor={resumo.proximoPagamento ? moeda(resumo.proximoPagamento.valor) : '—'}
              detalhe={
                resumo.proximoPagamento
                  ? `${resumo.proximoPagamento.contratoNumero} · ${data(resumo.proximoPagamento.data)}`
                  : 'Sem pagamentos previstos'
              }
            />
            <StatCard rotulo="Total já recebido" valor={moeda(resumo.totalRecebido)} />
          </SimpleGrid>
          <DashboardInvestidor contratos={resumo.contratos} />
        </>
      )}
    </>
  );
}

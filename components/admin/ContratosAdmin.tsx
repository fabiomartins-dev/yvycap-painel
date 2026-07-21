'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Anchor,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTransition } from 'react';
import {
  acaoConfirmarConciliacao,
  acaoEncerrarNoVencimento,
  acaoRegistrarAmortizacao,
} from '@/app/actions';
import { BadgeStatus } from '@/components/BadgeStatus';
import { data, moeda } from '@/lib/format';
import type { ContratoAdmin } from '@/services/admin';

export function ContratosAdmin({ contratos }: { contratos: ContratoAdmin[] }) {
  const [fase, setFase] = useState<string | null>(null);
  const [parceiro, setParceiro] = useState<string | null>(null);
  const [status, setStatus] = useState('todos');
  const [modalContrato, setModalContrato] = useState<ContratoAdmin | null>(null);
  const [tipoOperacao, setTipoOperacao] = useState<'amortizacao' | 'quitacao'>('amortizacao');
  const [valor, setValor] = useState<number | string>('');
  const [pendente, startTransition] = useTransition();

  const parceiros = useMemo(
    () => [...new Set(contratos.map((c) => c.parceiroNome))].map((p) => ({ value: p, label: p })),
    [contratos]
  );

  const hoje = new Date().toISOString().slice(0, 10);

  const filtrados = contratos.filter((c) => {
    if (fase && String(c.fase) !== fase) return false;
    if (parceiro && c.parceiroNome !== parceiro) return false;
    if (status === 'ativos' && (c.status === 'encerrado' || !c.conciliado)) return false;
    if (status === 'pendentes' && c.conciliado) return false;
    if (status === 'encerrados' && c.status !== 'encerrado') return false;
    return true;
  });

  function conciliar(id: string, numero: string) {
    startTransition(async () => {
      await acaoConfirmarConciliacao(id);
      notifications.show({ message: `Aporte do ${numero} conciliado.`, color: 'green' });
    });
  }

  function encerrar(id: string, numero: string) {
    startTransition(async () => {
      await acaoEncerrarNoVencimento(id);
      notifications.show({ message: `${numero} encerrado no vencimento.`, color: 'green' });
    });
  }

  function registrarOperacao() {
    if (!modalContrato) return;
    const v = tipoOperacao === 'quitacao' ? modalContrato.saldoAtivo : Number(valor);
    startTransition(async () => {
      await acaoRegistrarAmortizacao(modalContrato.id, v, tipoOperacao);
      notifications.show({
        title: tipoOperacao === 'quitacao' ? 'Quitação antecipada registrada' : 'Amortização registrada',
        message: `Efetiva após o aviso de ${modalContrato.avisoQuitacaoDias} dias ao investidor.`,
        color: 'green',
      });
      setModalContrato(null);
      setValor('');
    });
  }

  return (
    <Card>
      <Group gap="sm" mb="md" wrap="wrap">
        <Select
          placeholder="Todas as fases"
          data={[
            { value: '1', label: 'Fase 1' },
            { value: '2', label: 'Fase 2' },
            { value: '3', label: 'Fase 3' },
          ]}
          value={fase}
          onChange={setFase}
          clearable
          w={150}
          aria-label="Filtrar por fase"
        />
        <Select
          placeholder="Todos os parceiros"
          data={parceiros}
          value={parceiro}
          onChange={setParceiro}
          clearable
          w={200}
          aria-label="Filtrar por parceiro"
        />
        <SegmentedControl
          value={status}
          onChange={setStatus}
          data={[
            { value: 'todos', label: 'Todos' },
            { value: 'ativos', label: 'Ativos' },
            { value: 'pendentes', label: 'Pend. conciliação' },
            { value: 'encerrados', label: 'Encerrados' },
          ]}
        />
      </Group>

      {filtrados.length === 0 ? (
        <Text c="#66756e" py="lg" ta="center">
          Nenhum contrato com os filtros selecionados.
        </Text>
      ) : (
        <Table.ScrollContainer minWidth={960}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Contrato</Table.Th>
                <Table.Th>Investidor</Table.Th>
                <Table.Th>Parceiro</Table.Th>
                <Table.Th>Aporte</Table.Th>
                <Table.Th>Saldo ativo</Table.Th>
                <Table.Th>Vencimento</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtrados.map((c) => (
                <Table.Tr key={c.id}>
                  <Table.Td>
                    <Anchor component={Link} href={`/admin/contratos/${c.id}`} fw={600} c="#124534">
                      {c.numero}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>{c.investidorNome}</Table.Td>
                  <Table.Td>{c.parceiroNome}</Table.Td>
                  <Table.Td>{moeda(c.valorAporte)}</Table.Td>
                  <Table.Td>{moeda(c.saldoAtivo)}</Table.Td>
                  <Table.Td>{data(c.dataVencimento)}</Table.Td>
                  <Table.Td>
                    <BadgeStatus status={c.statusRotulo} />
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      {!c.conciliado && !c.estornado && (
                        <Button
                          size="compact-xs"
                          variant="light"
                          color="brand.8"
                          loading={pendente}
                          onClick={() => conciliar(c.id, c.numero)}
                        >
                          Conciliar
                        </Button>
                      )}
                      {c.conciliado && !c.estornado && c.status !== 'encerrado' && (
                        <Button
                          size="compact-xs"
                          variant="light"
                          color="gold.6"
                          onClick={() => {
                            setModalContrato(c);
                            setTipoOperacao('amortizacao');
                            setValor('');
                          }}
                        >
                          Amortizar/Quitar
                        </Button>
                      )}
                      {c.conciliado && c.status !== 'encerrado' && c.dataVencimento <= hoje && (
                        <Button
                          size="compact-xs"
                          variant="light"
                          color="gray"
                          loading={pendente}
                          onClick={() => encerrar(c.id, c.numero)}
                        >
                          Encerrar
                        </Button>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <Modal
        opened={!!modalContrato}
        onClose={() => setModalContrato(null)}
        title={`Amortização / quitação antecipada — ${modalContrato?.numero ?? ''}`}
        centered
      >
        <Stack gap="sm">
          <Text fz="sm" c="#66756e">
            A quitação antecipada pela YVYCAP exige aviso de{' '}
            <b>{modalContrato?.avisoQuitacaoDias ?? 60} dias</b> ao investidor. A operação será
            registrada com data efetiva após o aviso.
          </Text>
          <SegmentedControl
            value={tipoOperacao}
            onChange={(v) => setTipoOperacao(v as 'amortizacao' | 'quitacao')}
            data={[
              { value: 'amortizacao', label: 'Amortização parcial' },
              { value: 'quitacao', label: 'Quitação total' },
            ]}
          />
          {tipoOperacao === 'amortizacao' ? (
            <NumberInput
              label="Valor da amortização"
              prefix="R$ "
              thousandSeparator="."
              decimalSeparator=","
              min={0}
              max={modalContrato?.saldoAtivo ?? 0}
              value={valor}
              onChange={setValor}
            />
          ) : (
            <Text fz="sm">
              Saldo a quitar: <b>{moeda(modalContrato?.saldoAtivo ?? 0)}</b>
            </Text>
          )}
          <Button
            onClick={registrarOperacao}
            loading={pendente}
            disabled={tipoOperacao === 'amortizacao' && (!valor || Number(valor) <= 0)}
            color="brand.9"
          >
            Registrar com aviso de {modalContrato?.avisoQuitacaoDias ?? 60} dias
          </Button>
        </Stack>
      </Modal>
    </Card>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { Alert, Button, List, Modal, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { acaoSolicitarResgate } from '@/app/actions';
import { data as fmtData } from '@/lib/format';

export function BotaoResgate({
  contratoId,
  contratoNumero,
  resgateExistente,
}: {
  contratoId: string;
  contratoNumero: string;
  resgateExistente: { dataSolicitacao: string; dataLiberacao: string; status: string } | null;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [pendente, startTransition] = useTransition();

  if (resgateExistente) {
    return (
      <Alert color="orange" variant="light" title="Resgate antecipado em andamento">
        Solicitação registrada em {fmtData(resgateExistente.dataSolicitacao)} — liberação prevista a
        partir de {fmtData(resgateExistente.dataLiberacao)} (aviso prévio de 90 dias).
      </Alert>
    );
  }

  function confirmar() {
    startTransition(async () => {
      const r = await acaoSolicitarResgate(contratoId);
      setAberto(false);
      if (r.ok) {
        notifications.show({
          title: 'Solicitação de resgate registrada',
          message: `O resgate do contrato ${contratoNumero} seguirá o aviso prévio de 90 dias.`,
          color: 'green',
        });
        router.refresh();
      } else {
        notifications.show({
          title: 'Não foi possível registrar',
          message: 'Já existe uma solicitação em andamento ou o contrato está encerrado.',
          color: 'red',
        });
      }
    });
  }

  return (
    <>
      <Button variant="outline" color="brand.8" onClick={() => setAberto(true)}>
        Solicitar resgate antecipado
      </Button>
      <Modal
        opened={aberto}
        onClose={() => setAberto(false)}
        title="Solicitar resgate antecipado"
        centered
      >
        <Stack gap="sm">
          <Text fz="sm">
            O resgate antecipado do contrato <b>{contratoNumero}</b> segue as condições do contrato
            de mútuo:
          </Text>
          <List fz="sm" spacing={4}>
            <List.Item>
              <b>Aviso prévio de 90 dias</b> — o valor é liberado após esse prazo, contado a partir
              da solicitação.
            </List.Item>
            <List.Item>A YVYCAP confirmará a solicitação pelos canais oficiais.</List.Item>
            <List.Item>Os pagamentos previstos seguem normalmente até a liquidação.</List.Item>
          </List>
          <Button onClick={confirmar} loading={pendente} color="gold.5" c="#0c352a" fw={600}>
            Confirmar solicitação de resgate
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

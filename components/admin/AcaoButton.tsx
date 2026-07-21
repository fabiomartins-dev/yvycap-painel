'use client';

import { useTransition } from 'react';
import { Button, type ButtonProps } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';

export function AcaoButton({
  rotulo,
  acao,
  confirmacao,
  mensagemSucesso,
  ...props
}: {
  rotulo: string;
  acao: () => Promise<void>;
  confirmacao?: string;
  mensagemSucesso?: string;
} & ButtonProps) {
  const [pendente, startTransition] = useTransition();

  function executar() {
    startTransition(async () => {
      await acao();
      if (mensagemSucesso) {
        notifications.show({ message: mensagemSucesso, color: 'green' });
      }
    });
  }

  function clique() {
    if (confirmacao) {
      modals.openConfirmModal({
        title: rotulo,
        children: <Text fz="sm">{confirmacao}</Text>,
        labels: { confirm: 'Confirmar', cancel: 'Cancelar' },
        confirmProps: { color: 'brand.9' },
        onConfirm: executar,
      });
    } else {
      executar();
    }
  }

  return (
    <Button size="compact-xs" variant="light" color="brand.8" loading={pendente} onClick={clique} {...props}>
      {rotulo}
    </Button>
  );
}

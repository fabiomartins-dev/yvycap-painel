'use client';

import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export function BotaoDownload({ nome }: { nome: string }) {
  return (
    <Button
      size="compact-xs"
      variant="filled"
      color="brand.8"
      onClick={() =>
        notifications.show({
          title: 'Download iniciado',
          message: `${nome} (ambiente de demonstração — arquivo simulado)`,
          color: 'green',
        })
      }
    >
      Baixar
    </Button>
  );
}

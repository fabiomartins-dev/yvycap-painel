'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Group, Text } from '@mantine/core';

export function SessionBanner({ exp }: { exp: number }) {
  const router = useRouter();
  const [restante, setRestante] = useState(() => Math.max(0, exp - Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const t = setInterval(() => {
      const r = Math.max(0, exp - Math.floor(Date.now() / 1000));
      setRestante(r);
      if (r <= 0) {
        clearInterval(t);
        fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
          router.push('/login');
          router.refresh();
        });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [exp, router]);

  async function encerrar() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const mm = String(Math.floor(restante / 60)).padStart(2, '0');
  const ss = String(restante % 60).padStart(2, '0');

  return (
    <Group justify="center" gap="md" h={32} px="md" bg="#124534" wrap="nowrap">
      <Text fz="xs" c="rgba(255,255,255,0.85)" style={{ whiteSpace: 'nowrap' }}>
        Sessão expira em{' '}
        <Text component="span" fw={700} c="#dbba76" ff="monospace">
          {mm}:{ss}
        </Text>
      </Text>
      <Button size="compact-xs" variant="subtle" c="#dbba76" onClick={encerrar}>
        Encerrar sessão
      </Button>
    </Group>
  );
}

import { Text } from '@mantine/core';

export function Logo({ tamanho = 22 }: { tamanho?: number }) {
  return (
    <Text
      component="span"
      ff="var(--font-fraunces), Fraunces, serif"
      fw={600}
      fz={tamanho}
      style={{ letterSpacing: '0.22em', whiteSpace: 'nowrap', userSelect: 'none' }}
    >
      <Text component="span" c="white" inherit>
        YVY
      </Text>
      <Text component="span" c="#c8a45e" inherit>
        CAP
      </Text>
    </Text>
  );
}

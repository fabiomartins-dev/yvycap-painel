'use client';

import Link from 'next/link';
import { Anchor, Box, Breadcrumbs, Text, Title } from '@mantine/core';

export interface Migalha {
  rotulo: string;
  href?: string;
}

export function PageHeader({
  titulo,
  descricao,
  migalhas,
}: {
  titulo: string;
  descricao?: string;
  migalhas?: Migalha[];
}) {
  return (
    <Box mb="lg">
      {migalhas && migalhas.length > 0 && (
        <Breadcrumbs separator="›" mb={6} fz="xs">
          {migalhas.map((m) =>
            m.href ? (
              <Anchor key={m.rotulo} component={Link} href={m.href} fz="xs" c="#1b5c46">
                {m.rotulo}
              </Anchor>
            ) : (
              <Text key={m.rotulo} fz="xs" c="#66756e">
                {m.rotulo}
              </Text>
            )
          )}
        </Breadcrumbs>
      )}
      <Title order={1} fz="h2" c="#22302b">
        {titulo}
      </Title>
      {descricao && (
        <Text c="#66756e" fz="sm" mt={4}>
          {descricao}
        </Text>
      )}
    </Box>
  );
}

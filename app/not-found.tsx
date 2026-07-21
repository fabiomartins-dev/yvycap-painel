'use client';

import Link from 'next/link';
import { Box, Button, Center, Stack, Text, Title } from '@mantine/core';

export default function NotFound() {
  return (
    <Box mih="100dvh" bg="#f6f3ec">
      <Center mih="100dvh" px="md">
        <Stack align="center" gap="sm">
          <Text ff="var(--font-fraunces), serif" fz={72} fw={600} c="#c8a45e" lh={1}>
            404
          </Text>
          <Title order={1} fz="h3" ta="center">
            Página não encontrada
          </Title>
          <Text c="#66756e" ta="center" maw={420}>
            O endereço acessado não existe ou você não tem permissão para visualizá-lo.
          </Text>
          <Button component={Link} href="/" mt="sm" color="brand.9">
            Voltar para o painel
          </Button>
        </Stack>
      </Center>
    </Box>
  );
}

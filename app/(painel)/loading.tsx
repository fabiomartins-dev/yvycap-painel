import { SimpleGrid, Skeleton, Stack } from '@mantine/core';

export default function Loading() {
  return (
    <Stack gap="md">
      <Skeleton height={36} width="40%" radius="md" />
      <Skeleton height={16} width="60%" radius="md" />
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
        <Skeleton height={100} radius="md" />
        <Skeleton height={100} radius="md" />
        <Skeleton height={100} radius="md" />
        <Skeleton height={100} radius="md" />
      </SimpleGrid>
      <Skeleton height={320} radius="md" />
    </Stack>
  );
}

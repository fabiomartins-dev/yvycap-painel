import { Box, Divider, Stack, Text } from '@mantine/core';

export function Rodape() {
  return (
    <Box component="footer" mt="xl" pb="md">
      <Divider color="#e5decf" mb="md" />
      <Stack gap={4}>
        <Text fz="xs" c="#66756e">
          YVYCAP · YVY CAP LTDA · CNPJ 61.250.347/0001-87 · R. Francisco Zicardi, 519 · Jardim
          Anália Franco · São Paulo/SP · CEP 03335-090
        </Text>
        <Text fz="xs" c="#66756e">
          Em caso de divergência, prevalecem o contrato assinado e os registros oficiais da YVYCAP.
        </Text>
      </Stack>
    </Box>
  );
}

import { Box, Card, Center, List, Stack, Text, Title } from '@mantine/core';
import { AnchorLink } from '@/components/AppLink';
import { Logo } from '@/components/Logo';

export const metadata = { title: 'Esqueci minha senha' };

export default function EsqueciSenhaPage() {
  return (
    <Box mih="100dvh" bg="#0c352a" py="xl">
      <Center mih="90dvh" px="md">
        <Stack w="100%" maw={480} gap="lg">
          <Center>
            <Logo tamanho={30} />
          </Center>
          <Card padding="xl">
            <Stack gap="md">
              <Title order={2} fz="h3">
                Recuperação de acesso
              </Title>
              <Text>
                Por segurança, as credenciais de acesso ao painel são enviadas somente pelos canais
                oficiais da YVYCAP. Para redefinir sua senha, entre em contato:
              </Text>
              <List spacing="xs">
                <List.Item>
                  E-mail: <b>atendimento@yvycap.com.br</b>
                </List.Item>
                <List.Item>
                  Telefone/WhatsApp: <b>(11) 4000-0000</b> — dias úteis, das 9h às 18h
                </List.Item>
              </List>
              <Text c="#66756e" fz="sm">
                Nossa equipe confirmará sua identidade e enviará uma nova credencial. A YVYCAP nunca
                solicita sua senha por telefone ou mensagem.
              </Text>
              <AnchorLink href="/login" c="#1b5c46">
                ← Voltar para o login
              </AnchorLink>
            </Stack>
          </Card>
        </Stack>
      </Center>
    </Box>
  );
}

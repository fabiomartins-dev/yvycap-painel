'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Checkbox, Modal, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { acaoAceitarTermos } from '@/app/actions';

export function TermosGate({ nome }: { nome: string }) {
  const router = useRouter();
  const [aceito, setAceito] = useState(false);
  const [pendente, startTransition] = useTransition();

  function aceitar() {
    startTransition(async () => {
      await acaoAceitarTermos();
      router.refresh();
    });
  }

  return (
    <Box mih="60dvh">
      <Modal
        opened
        onClose={() => {}}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        centered
        size="lg"
        title={<Title order={3}>Termos de Uso e Privacidade dos Painéis</Title>}
      >
        <Stack gap="md">
          <Text fz="sm">
            Olá, {nome}. Antes do primeiro acesso ao conteúdo do painel, é necessário ler e aceitar
            os Termos de Uso e a Política de Privacidade, em conformidade com a Lei Geral de
            Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </Text>
          <ScrollArea h={220} type="auto" style={{ border: '1px solid #e5decf', borderRadius: 8 }} p="sm">
            <Stack gap="xs" fz="sm" p="xs">
              <Text fz="sm">
                <b>1. Objeto.</b> Este painel destina-se exclusivamente ao acompanhamento da
                operação de captação privada da YVYCAP por contratos de mútuo, pelos usuários
                autorizados (investidores, parceiros e equipe YVYCAP).
              </Text>
              <Text fz="sm">
                <b>2. Confidencialidade.</b> As informações exibidas são confidenciais e de uso
                pessoal e intransferível. É vedado compartilhar credenciais de acesso ou divulgar
                dados de terceiros obtidos no painel.
              </Text>
              <Text fz="sm">
                <b>3. Tratamento de dados pessoais.</b> A YVYCAP trata os dados pessoais dos
                usuários com a finalidade de gestão da operação, cumprimento de obrigações legais e
                comunicação pelos canais oficiais, nos termos da LGPD. Dados são minimizados nas
                listagens e o acesso é segregado por permissão.
              </Text>
              <Text fz="sm">
                <b>4. Direitos do titular.</b> O usuário pode solicitar confirmação de tratamento,
                acesso, correção e demais direitos previstos na LGPD pelos canais oficiais da
                YVYCAP.
              </Text>
              <Text fz="sm">
                <b>5. Registros oficiais.</b> Em caso de divergência entre as informações do painel
                e os documentos assinados, prevalecem o contrato assinado e os registros oficiais da
                YVYCAP.
              </Text>
              <Text fz="sm">
                <b>6. Sessão e segurança.</b> A sessão expira em 1 hora ou ao fechar o navegador. O
                usuário é responsável por encerrar a sessão em dispositivos compartilhados.
              </Text>
            </Stack>
          </ScrollArea>
          <Checkbox
            label="Li e aceito os Termos de Uso e a Política de Privacidade dos Painéis"
            checked={aceito}
            onChange={(e) => setAceito(e.currentTarget.checked)}
          />
          <Button onClick={aceitar} disabled={!aceito} loading={pendente} color="gold.5" c="#0c352a" fw={600}>
            Aceitar e acessar o painel
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
}

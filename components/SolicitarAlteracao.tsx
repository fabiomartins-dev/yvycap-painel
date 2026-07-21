'use client';

import { useState, useTransition } from 'react';
import { Button, Modal, Stack, Text, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { acaoSolicitarAlteracaoCadastro } from '@/app/actions';

export function SolicitarAlteracao() {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [pendente, startTransition] = useTransition();

  function enviar() {
    startTransition(async () => {
      await acaoSolicitarAlteracaoCadastro(mensagem);
      setAberto(false);
      setMensagem('');
      notifications.show({
        title: 'Solicitação registrada',
        message: 'A equipe YVYCAP analisará a alteração e retornará pelos canais oficiais.',
        color: 'green',
      });
    });
  }

  return (
    <>
      <Button variant="filled" color="brand.8" size="xs" onClick={() => setAberto(true)}>
        Solicitar alteração de dados
      </Button>
      <Modal opened={aberto} onClose={() => setAberto(false)} title="Solicitar alteração de dados" centered>
        <Stack gap="sm">
          <Text fz="sm" c="#66756e">
            Os dados cadastrais são somente leitura. Descreva a alteração desejada e a equipe
            YVYCAP fará a atualização após validação.
          </Text>
          <Textarea
            placeholder="Ex.: atualizar telefone para (11) 9..."
            minRows={3}
            value={mensagem}
            onChange={(e) => setMensagem(e.currentTarget.value)}
          />
          <Button onClick={enviar} disabled={mensagem.trim().length < 5} loading={pendente} color="gold.5" c="#0c352a">
            Enviar solicitação
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

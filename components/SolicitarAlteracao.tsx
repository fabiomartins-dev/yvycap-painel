'use client';

import { useState, useTransition } from 'react';
import { Button, Modal, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { acaoSolicitarAlteracaoCadastro } from '@/app/actions';

type DadosCadastro = {
  nome: string;
  email: string;
  documento: string | null;
  telefone: string | null;
};

export function SolicitarAlteracao({ dados }: { dados: DadosCadastro }) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState(dados.nome);
  const [email, setEmail] = useState(dados.email);
  const [documento, setDocumento] = useState(dados.documento ?? '');
  const [telefone, setTelefone] = useState(dados.telefone ?? '');
  const [observacoes, setObservacoes] = useState('');
  const [pendente, startTransition] = useTransition();

  function reset() {
    setNome(dados.nome);
    setEmail(dados.email);
    setDocumento(dados.documento ?? '');
    setTelefone(dados.telefone ?? '');
    setObservacoes('');
  }

  function fechar() {
    setAberto(false);
    reset();
  }

  const alterou =
    nome !== dados.nome ||
    email !== dados.email ||
    documento !== (dados.documento ?? '') ||
    telefone !== (dados.telefone ?? '') ||
    observacoes.trim().length > 0;

  function enviar() {
    const linhas: string[] = ['Solicitação de atualização de dados cadastrais:'];
    if (nome !== dados.nome) linhas.push(`Nome: "${dados.nome}" → "${nome}"`);
    if (email !== dados.email) linhas.push(`E-mail: "${dados.email}" → "${email}"`);
    if (documento !== (dados.documento ?? ''))
      linhas.push(`CPF/CNPJ: "${dados.documento ?? '—'}" → "${documento}"`);
    if (telefone !== (dados.telefone ?? ''))
      linhas.push(`Telefone: "${dados.telefone ?? '—'}" → "${telefone}"`);
    if (observacoes.trim()) linhas.push(`Observações: ${observacoes.trim()}`);

    startTransition(async () => {
      await acaoSolicitarAlteracaoCadastro(linhas.join('\n'));
      fechar();
      notifications.show({
        title: 'Recebemos seus dados',
        message:
          'Recebemos sua solicitação de alteração. Em breve você receberá informações sobre a atualização dos dados pelos canais oficiais da YVYCAP.',
        color: 'green',
      });
    });
  }

  return (
    <>
      <Button variant="filled" color="brand.8" size="xs" onClick={() => setAberto(true)}>
        Solicitar alteração de dados
      </Button>
      <Modal opened={aberto} onClose={fechar} title="Solicitar alteração de dados" centered>
        <Stack gap="sm">
          <Text fz="sm" c="#66756e">
            Edite abaixo os dados que deseja atualizar e clique em enviar. A equipe YVYCAP fará a
            atualização após validação.
          </Text>
          <TextInput label="Nome" value={nome} onChange={(e) => setNome(e.currentTarget.value)} />
          <TextInput
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <TextInput
            label="CPF/CNPJ"
            value={documento}
            onChange={(e) => setDocumento(e.currentTarget.value)}
          />
          <TextInput
            label="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.currentTarget.value)}
          />
          <Textarea
            label="Observações (opcional)"
            placeholder="Detalhe qualquer informação adicional sobre a alteração."
            minRows={2}
            value={observacoes}
            onChange={(e) => setObservacoes(e.currentTarget.value)}
          />
          <Button onClick={enviar} disabled={!alterou} loading={pendente} color="gold.5" c="#0c352a">
            Enviar solicitação
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

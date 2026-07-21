'use client';

import { useState, useTransition } from 'react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  acaoAlternarUsuarioAtivo,
  acaoAtualizarPermissoes,
  acaoCriarUsuario,
  acaoResetarAcesso,
} from '@/app/actions';
import { data } from '@/lib/format';
import type { Permissao, UsuarioPublico } from '@/lib/types';

const TODAS: { valor: Permissao; rotulo: string }[] = [
  { valor: 'investidor', rotulo: 'Investidor' },
  { valor: 'parceiro', rotulo: 'Parceiro' },
  { valor: 'admin', rotulo: 'Administrador' },
];

export function UsuariosAdmin({ usuarios }: { usuarios: UsuarioPublico[] }) {
  const [novoAberto, setNovoAberto] = useState(false);
  const [editando, setEditando] = useState<UsuarioPublico | null>(null);
  const [permissoesEdit, setPermissoesEdit] = useState<Permissao[]>([]);
  const [pendente, startTransition] = useTransition();

  const form = useForm<{ nome: string; email: string; permissoes: Permissao[] }>({
    initialValues: { nome: '', email: '', permissoes: [] },
    validate: {
      nome: (v) => (v.trim().length >= 3 ? null : 'Informe o nome'),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'E-mail inválido'),
      permissoes: (v) => (v.length > 0 ? null : 'Selecione ao menos uma permissão'),
    },
  });

  function criar(values: typeof form.values) {
    startTransition(async () => {
      await acaoCriarUsuario(values);
      setNovoAberto(false);
      form.reset();
      notifications.show({
        title: 'Usuário criado',
        message: 'Credenciais são enviadas somente pelos canais oficiais da YVYCAP.',
        color: 'green',
      });
    });
  }

  function salvarPermissoes() {
    if (!editando) return;
    startTransition(async () => {
      await acaoAtualizarPermissoes(editando.id, permissoesEdit);
      setEditando(null);
      notifications.show({ message: 'Permissões atualizadas.', color: 'green' });
    });
  }

  function reset(u: UsuarioPublico) {
    startTransition(async () => {
      await acaoResetarAcesso(u.id);
      notifications.show({
        title: 'Acesso resetado',
        message: `Nova credencial de ${u.nome} será enviada pelos canais oficiais.`,
        color: 'green',
      });
    });
  }

  function alternarAtivo(u: UsuarioPublico) {
    startTransition(async () => {
      await acaoAlternarUsuarioAtivo(u.id);
    });
  }

  return (
    <Card>
      <Group justify="flex-end" mb="md">
        <Button color="gold.5" c="#0c352a" fw={600} onClick={() => setNovoAberto(true)}>
          Criar usuário
        </Button>
      </Group>

      <Table.ScrollContainer minWidth={760}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome</Table.Th>
              <Table.Th>E-mail</Table.Th>
              <Table.Th>Permissões</Table.Th>
              <Table.Th>Situação</Table.Th>
              <Table.Th>Criado em</Table.Th>
              <Table.Th>Ações</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {usuarios.map((u) => (
              <Table.Tr key={u.id}>
                <Table.Td fw={600}>{u.nome}</Table.Td>
                <Table.Td>{u.email}</Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {u.permissoes.map((p) => (
                      <Badge key={p} size="xs" variant="light" color="brand.8">
                        {TODAS.find((t) => t.valor === p)?.rotulo}
                      </Badge>
                    ))}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge size="xs" variant="light" color={u.ativo ? 'brand.7' : 'red'}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </Table.Td>
                <Table.Td>{data(u.criadoEm)}</Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Button
                      size="compact-xs"
                      variant="light"
                      color="brand.8"
                      onClick={() => {
                        setEditando(u);
                        setPermissoesEdit(u.permissoes);
                      }}
                    >
                      Permissões
                    </Button>
                    <Button size="compact-xs" variant="light" color="gold.6" loading={pendente} onClick={() => reset(u)}>
                      Reset de acesso
                    </Button>
                    <Button
                      size="compact-xs"
                      variant="light"
                      color={u.ativo ? 'red' : 'brand.7'}
                      loading={pendente}
                      onClick={() => alternarAtivo(u)}
                    >
                      {u.ativo ? 'Desativar' : 'Ativar'}
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Modal opened={novoAberto} onClose={() => setNovoAberto(false)} title="Criar usuário" centered>
        <form onSubmit={form.onSubmit(criar)}>
          <Stack gap="sm">
            <TextInput label="Nome" {...form.getInputProps('nome')} />
            <TextInput label="E-mail (login)" {...form.getInputProps('email')} />
            <Checkbox.Group
              label="Permissões (combináveis)"
              {...form.getInputProps('permissoes')}
            >
              <Group mt="xs">
                {TODAS.map((t) => (
                  <Checkbox key={t.valor} value={t.valor} label={t.rotulo} />
                ))}
              </Group>
            </Checkbox.Group>
            <Button type="submit" loading={pendente} color="gold.5" c="#0c352a" fw={600}>
              Criar usuário
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={!!editando}
        onClose={() => setEditando(null)}
        title={`Permissões — ${editando?.nome ?? ''}`}
        centered
      >
        <Stack gap="sm">
          <Text fz="sm" c="#66756e">
            As permissões são combináveis: o usuário vê no painel as seções correspondentes.
          </Text>
          <Checkbox.Group
            value={permissoesEdit}
            onChange={(v) => setPermissoesEdit(v as Permissao[])}
          >
            <Stack mt="xs" gap="xs">
              {TODAS.map((t) => (
                <Checkbox key={t.valor} value={t.valor} label={t.rotulo} />
              ))}
            </Stack>
          </Checkbox.Group>
          <Button onClick={salvarPermissoes} loading={pendente} disabled={permissoesEdit.length === 0} color="brand.9">
            Salvar permissões
          </Button>
        </Stack>
      </Modal>
    </Card>
  );
}

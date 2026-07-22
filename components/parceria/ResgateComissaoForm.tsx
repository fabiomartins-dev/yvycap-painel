'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  Group,
  NumberInput,
  PasswordInput,
  PinInput,
  Stack,
  Stepper,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ButtonLink } from '@/components/AppLink';
import { acaoConfirmarResgateComissao, acaoIniciarResgateComissao } from '@/app/actions';
import { moeda } from '@/lib/format';

export function ResgateComissaoForm({ saldoDisponivel }: { saldoDisponivel: number }) {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [pendente, startTransition] = useTransition();

  const [valor, setValor] = useState<number | string>(saldoDisponivel);
  const [senha, setSenha] = useState('');
  const [token, setToken] = useState('');
  const [telefone, setTelefone] = useState('');
  const [codigoDemo, setCodigoDemo] = useState('');

  const semSaldo = saldoDisponivel <= 0;

  function irParaVerificacao() {
    const v = Number(valor);
    if (!Number.isFinite(v) || v <= 0 || v > saldoDisponivel + 0.001) {
      notifications.show({
        title: 'Valor inválido',
        message: `Informe um valor entre ${moeda(0.01)} e ${moeda(saldoDisponivel)}.`,
        color: 'red',
      });
      return;
    }
    startTransition(async () => {
      const r = await acaoIniciarResgateComissao(v);
      if (r.ok) {
        setTelefone(r.telefoneMascarado ?? '');
        setCodigoDemo(r.codigoDemo ?? '');
        setToken('');
        setSenha('');
        setPasso(1);
        notifications.show({
          title: 'Código enviado',
          message: `Enviamos um código de verificação por SMS para ${r.telefoneMascarado ?? 'seu telefone'}.`,
          color: 'green',
        });
      } else {
        notifications.show({ title: 'Não foi possível continuar', message: r.motivo ?? 'Tente novamente.', color: 'red' });
      }
    });
  }

  function confirmar() {
    if (senha.trim().length === 0) {
      notifications.show({ title: 'Informe a senha', message: 'Digite sua senha para confirmar.', color: 'red' });
      return;
    }
    if (token.trim().length !== 6) {
      notifications.show({ title: 'Código incompleto', message: 'Digite os 6 dígitos recebidos por SMS.', color: 'red' });
      return;
    }
    startTransition(async () => {
      const r = await acaoConfirmarResgateComissao(Number(valor), senha, token);
      if (r.ok) {
        notifications.show({
          title: 'Resgate solicitado',
          message: `O resgate de ${moeda(Number(valor))} em comissões seguirá para pagamento pelos canais oficiais.`,
          color: 'green',
        });
        router.push('/parceria/comissoes');
        router.refresh();
      } else {
        notifications.show({ title: 'Não foi possível confirmar', message: r.motivo ?? 'Tente novamente.', color: 'red' });
      }
    });
  }

  if (semSaldo) {
    return (
      <Card maw={560}>
        <Stack gap="sm">
          <Alert color="orange" variant="light">
            Você não possui saldo de comissão disponível para resgate no momento.
          </Alert>
          <ButtonLink href="/parceria/comissoes" variant="default">
            Voltar
          </ButtonLink>
        </Stack>
      </Card>
    );
  }

  return (
    <Card maw={560}>
      <Stepper active={passo} size="sm" mb="lg">
        <Stepper.Step label="Valor" description="Quanto resgatar" />
        <Stepper.Step label="Verificação" description="Senha e token SMS" />
      </Stepper>

      {passo === 0 ? (
        <Stack gap="sm">
          <Text fz="sm">
            Saldo disponível para resgate: <b>{moeda(saldoDisponivel)}</b>
          </Text>
          <NumberInput
            label="Valor do resgate"
            prefix="R$ "
            thousandSeparator="."
            decimalSeparator=","
            min={0}
            max={saldoDisponivel}
            allowNegative={false}
            value={valor}
            onChange={setValor}
          />
          <Text fz="xs" c="#66756e">
            O resgate abrange apenas a comissão já reconhecida (paga). Na próxima etapa você
            confirmará com a sua senha e o código enviado por SMS.
          </Text>
          <Group justify="flex-end" mt="xs">
            <ButtonLink href="/parceria/comissoes" variant="default">
              Cancelar
            </ButtonLink>
            <Button onClick={irParaVerificacao} loading={pendente} color="gold.5" c="#0c352a" fw={600}>
              Continuar
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="sm">
          <Text fz="sm">
            Confirmando o resgate de <b>{moeda(Number(valor))}</b>.
          </Text>
          <Alert color="blue" variant="light">
            Enviamos um código de verificação por SMS para <b>{telefone || 'seu telefone'}</b>.
            {codigoDemo && (
              <Text fz="xs" mt={4} c="#66756e">
                Modo demonstração — código: <b>{codigoDemo}</b>
              </Text>
            )}
          </Alert>
          <PasswordInput
            label="Senha"
            placeholder="Sua senha de acesso"
            value={senha}
            onChange={(e) => setSenha(e.currentTarget.value)}
          />
          <div>
            <Text fz="sm" fw={500} mb={4}>
              Token SMS
            </Text>
            <PinInput length={6} type="number" value={token} onChange={setToken} oneTimeCode />
          </div>
          <Group justify="space-between" mt="xs">
            <Button variant="subtle" color="gray" onClick={() => setPasso(0)} disabled={pendente}>
              Voltar
            </Button>
            <Button onClick={confirmar} loading={pendente} color="gold.5" c="#0c352a" fw={600}>
              Confirmar resgate
            </Button>
          </Group>
        </Stack>
      )}
    </Card>
  );
}

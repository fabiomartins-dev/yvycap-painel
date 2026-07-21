// Token de sessão assinado (HMAC-SHA256 via Web Crypto — compatível com Edge e Node).
// Payload: { userId, permissoes, exp } em cookie httpOnly de sessão.

import type { Permissao } from './types';

export const COOKIE_SESSAO = 'yvycap_sessao';
export const DURACAO_SESSAO_SEGUNDOS = 60 * 60; // 1 hora

const SEGREDO = process.env.SESSION_SECRET ?? 'yvycap-mock-secret-trocar-em-producao';

export interface SessaoPayload {
  userId: string;
  permissoes: Permissao[];
  /** epoch em segundos */
  exp: number;
}

function b64url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function chave(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SEGREDO),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function assinarSessao(payload: SessaoPayload): Promise<string> {
  const corpo = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const assinatura = await crypto.subtle.sign('HMAC', await chave(), new TextEncoder().encode(corpo));
  return `${corpo}.${b64url(new Uint8Array(assinatura))}`;
}

export async function verificarSessao(token: string | undefined): Promise<SessaoPayload | null> {
  if (!token) return null;
  const [corpo, assinatura] = token.split('.');
  if (!corpo || !assinatura) return null;
  try {
    const valido = await crypto.subtle.verify(
      'HMAC',
      await chave(),
      b64urlDecode(assinatura) as unknown as ArrayBuffer,
      new TextEncoder().encode(corpo)
    );
    if (!valido) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(corpo))) as SessaoPayload;
    if (!payload.userId || !Array.isArray(payload.permissoes)) return null;
    if (payload.exp * 1000 <= Date.now()) return null; // expirado
    return payload;
  } catch {
    return null;
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_SESSAO } from '@/lib/session';

export async function POST() {
  const store = await cookies();
  store.delete(COOKIE_SESSAO);
  return NextResponse.json({ ok: true });
}

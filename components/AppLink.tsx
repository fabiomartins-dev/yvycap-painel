'use client';

import Link from 'next/link';
import { Anchor, AnchorProps, Button, ButtonProps } from '@mantine/core';
import type { ReactNode } from 'react';

export function AnchorLink({
  href,
  children,
  ...props
}: AnchorProps & { href: string; children?: ReactNode }) {
  return (
    <Anchor component={Link} href={href} {...props}>
      {children}
    </Anchor>
  );
}

export function ButtonLink({
  href,
  children,
  ...props
}: ButtonProps & { href: string; children?: ReactNode }) {
  return (
    <Button component={Link} href={href} {...props}>
      {children}
    </Button>
  );
}

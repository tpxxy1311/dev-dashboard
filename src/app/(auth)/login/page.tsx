// src/app/(auth)/login/page.tsx
'use client';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  return (
    <button
      onClick={() =>
        authClient.signIn.social({
          provider: 'github',
          callbackURL: '/',
        })
      }
    >
      Mit GitHub anmelden
    </button>
  );
}
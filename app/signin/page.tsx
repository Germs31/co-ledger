'use client';

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl
    });
    if (res?.error) {
      setError('Invalid credentials');
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <main className="mx-auto max-w-md space-y-6">
      <div className="card space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neon-400">Welcome back</h2>
          <p className="text-sm text-gray-400">Sign in or create your local account</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="btn btn-primary w-full" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>
      </div>
      <p className="text-xs text-gray-500">
        First sign-in creates your local account automatically.
      </p>
    </main>
  );
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/fetcher';
import { useState } from 'react';

interface IncomeResp {
  incomes: { member: 'primary' | 'partner'; income: number; effectiveFrom?: string | null }[];
  totalIncome: number;
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery<IncomeResp>({ queryKey: ['income'], queryFn: () => apiGet('/api/income') });
  const [amount, setAmount] = useState('');
  const [member, setMember] = useState<'primary' | 'partner'>('primary');

  const save = useMutation({
    mutationFn: () => apiPost('/api/income', { amount: Number(amount), member }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['income'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
      setAmount('');
    }
  });

  return (
    <main className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-neon-400">Income</h2>
        <p className="text-sm text-gray-400">Set your monthly take-home</p>
      </div>

      <div className="card space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {data?.incomes.map((inc) => (
            <div key={inc.member} className="rounded-lg bg-ink-800 p-3">
              <p className="text-sm text-gray-400">{inc.member === 'primary' ? 'Your income' : 'Partner income'}</p>
              <p className="text-2xl font-semibold text-neon-400">${(inc.income ?? 0).toFixed(2)}</p>
              {inc.effectiveFrom && (
                <p className="text-xs text-gray-500">Since {new Date(inc.effectiveFrom).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <label className="label" htmlFor="amount">Update amount</label>
            <select className="input w-40" value={member} onChange={(e) => setMember(e.target.value as 'primary' | 'partner')}>
              <option value="primary">You</option>
              <option value="partner">Partner</option>
            </select>
          </div>
          <input
            id="amount"
            className="input"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 4000"
          />
          <button className="btn btn-primary w-fit" onClick={() => save.mutate()} disabled={save.isLoading}>
            {save.isLoading ? 'Saving…' : 'Save income'}
          </button>
          {save.isError && <p className="text-sm text-red-400">Failed to save</p>}
        </div>
      </div>
    </main>
  );
}

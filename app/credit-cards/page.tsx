'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from '@/lib/fetcher';
import { useMemo, useState } from 'react';

interface Card {
  id: string;
  name: string;
  minPayment: number;
  balance?: number;
  nextDueDate: string;
  member?: 'primary' | 'partner';
}

export default function CreditCardsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<Card[]>({ queryKey: ['cards'], queryFn: () => apiGet('/api/cards') });

  const [form, setForm] = useState({ name: '', minPayment: '', balance: '', dueDate: '', member: 'primary' as 'primary' | 'partner' });

  const createCard = useMutation({
    mutationFn: () =>
      apiPost('/api/cards', {
        name: form.name,
        minPayment: Number(form.minPayment),
        balance: form.balance ? Number(form.balance) : undefined,
        dueDate: new Date(form.dueDate).toISOString(),
        member: form.member
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cards'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
      setForm({ name: '', minPayment: '', balance: '', dueDate: '', member: form.member });
    }
  });

  const deleteCard = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/cards/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cards'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
    }
  });

  const cardsByMember = useMemo(() => {
    return (data ?? []).reduce(
      (acc, card) => {
        const key = card.member === 'partner' ? 'partner' : 'primary';
        acc[key].push(card);
        return acc;
      },
      { primary: [] as Card[], partner: [] as Card[] }
    );
  }, [data]);

  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neon-400">Credit cards</h2>
        <p className="text-sm text-gray-400">Track minimum payments and balances</p>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold">Add card</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Name">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Minimum payment">
            <input className="input" type="number" value={form.minPayment} onChange={(e) => setForm({ ...form, minPayment: e.target.value })} />
          </Field>
          <Field label="Balance (optional)">
            <input className="input" type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} />
          </Field>
          <Field label="Due date (first month)">
            <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Field>
          <Field label="Person">
            <select className="input" value={form.member} onChange={(e) => setForm({ ...form, member: e.target.value as 'primary' | 'partner' })}>
              <option value="primary">You</option>
              <option value="partner">Partner</option>
            </select>
          </Field>
        </div>
        <button className="btn btn-primary w-fit" onClick={() => createCard.mutate()} disabled={createCard.isLoading}>
          {createCard.isLoading ? 'Adding…' : 'Add card'}
        </button>
        {createCard.isError && <p className="text-sm text-red-400">Failed to add card</p>}
      </div>

      {(['primary', 'partner'] as const).map((member) => (
        <div key={member} className="card space-y-3">
          <h3 className="font-semibold">{member === 'primary' ? 'Your cards' : 'Partner cards'}</h3>
          {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
          <div className="space-y-2">
            {cardsByMember[member].length === 0 && <p className="text-sm text-gray-500">No cards yet</p>}
            {cardsByMember[member].map((card) => (
              <div key={card.id} className="flex items-center justify-between rounded-lg bg-ink-800 px-3 py-2">
                <div>
                  <p className="font-medium">{card.name}</p>
                  <p className="text-xs text-gray-500">Due {new Date(card.nextDueDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-neon-400 font-semibold">${card.minPayment.toFixed(2)}</p>
                    {card.balance && <p className="text-xs text-gray-500">Balance ${card.balance.toFixed(2)}</p>}
                  </div>
                  <button className="text-sm text-red-400" onClick={() => deleteCard.mutate(card.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-gray-300">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

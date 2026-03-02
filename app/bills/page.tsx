'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from '@/lib/fetcher';
import { useMemo, useState } from 'react';

interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  nextDueDate: string;
  member?: 'primary' | 'partner';
}

export default function BillsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<Bill[]>({ queryKey: ['bills'], queryFn: () => apiGet('/api/bills') });

  const [form, setForm] = useState({ name: '', amount: '', category: 'Bills', dueDate: '', member: 'primary' as 'primary' | 'partner' });

  const createBill = useMutation({
    mutationFn: () =>
      apiPost('/api/bills', {
        name: form.name,
        amount: Number(form.amount),
        category: form.category,
        dueDate: new Date(form.dueDate).toISOString(),
        member: form.member
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
      setForm({ name: '', amount: '', category: 'Bills', dueDate: '', member: form.member });
    }
  });

  const deleteBill = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/bills/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
    }
  });

  const billsByMember = useMemo(() => {
    return (data ?? []).reduce(
      (acc, bill) => {
        const key = bill.member === 'partner' ? 'partner' : 'primary';
        acc[key].push(bill);
        return acc;
      },
      { primary: [] as Bill[], partner: [] as Bill[] }
    );
  }, [data]);

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neon-400">Bills</h2>
          <p className="text-sm text-gray-400">Monthly commitments</p>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold">Add bill</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Name">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Amount">
            <input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="Category">
            <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
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
        <button className="btn btn-primary w-fit" onClick={() => createBill.mutate()} disabled={createBill.isLoading}>
          {createBill.isLoading ? 'Adding…' : 'Add bill'}
        </button>
        {createBill.isError && <p className="text-sm text-red-400">Failed to add bill</p>}
      </div>

      {(['primary', 'partner'] as const).map((member) => (
        <div key={member} className="card space-y-3">
          <h3 className="font-semibold">{member === 'primary' ? 'Your bills' : 'Partner bills'}</h3>
          {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
          <div className="space-y-2">
            {billsByMember[member].length === 0 && <p className="text-sm text-gray-500">No bills yet</p>}
            {billsByMember[member].map((bill) => (
              <div key={bill.id} className="flex items-center justify-between rounded-lg bg-ink-800 px-3 py-2">
                <div>
                  <p className="font-medium">{bill.name}</p>
                  <p className="text-xs text-gray-500">Due {new Date(bill.nextDueDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-neon-400 font-semibold">${bill.amount.toFixed(2)}</p>
                  <button className="text-sm text-red-400" onClick={() => deleteBill.mutate(bill.id)}>
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

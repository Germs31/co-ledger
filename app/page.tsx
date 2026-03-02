'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/fetcher';

type Member = 'primary' | 'partner';

interface MemberSummary {
  member: Member;
  month: string;
  income: number;
  billTotal: number;
  cardMinTotal: number;
  remaining: number;
  bills: any[];
  cards: any[];
}

interface SummaryResponse {
  summaries: MemberSummary[];
  combined: { income: number; billTotal: number; cardMinTotal: number; remaining: number };
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useQuery<SummaryResponse>({
    queryKey: ['summary'],
    queryFn: () => apiGet('/api/summary')
  });

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold">This Month</h2>
        <button className="btn btn-ghost text-sm" onClick={() => refetch()}>
          Refresh
        </button>
        <div className="flex gap-2 text-sm text-gray-400">
          <Link href="/settings" className="btn btn-ghost px-3 py-1">Income</Link>
          <Link href="/bills" className="btn btn-ghost px-3 py-1">Bills</Link>
          <Link href="/credit-cards" className="btn btn-ghost px-3 py-1">Credit Cards</Link>
        </div>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-400 text-sm">{String(error)}</p>}

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {data.summaries.map((s) => (
              <div key={s.member} className="space-y-4 card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold capitalize">{labelForMember(s.member)}</h3>
                  <span className="pill">{s.month}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Income" value={s.income} highlight />
                  <Stat label="Bills" value={s.billTotal} />
                  <Stat label="Card mins" value={s.cardMinTotal} />
                  <Stat label="Remaining" value={s.remaining} highlight={s.remaining >= 0} negative={s.remaining < 0} />
                </div>
                <div className="grid gap-3">
                  <CardList title="Upcoming Bills" items={s.bills} empty="No bills yet" />
                  <CardList title="Credit Cards" items={s.cards} empty="No cards yet" cardMode />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <HouseholdCard combined={data.combined} />
            <Comparison combined={data.combined} summaries={data.summaries} />
          </div>
        </>
      )}
    </main>
  );
}

function labelForMember(member: Member) {
  return member === 'primary' ? 'You' : 'Partner';
}

function Stat({ label, value, highlight, negative }: { label: string; value: number; highlight?: boolean; negative?: boolean }) {
  return (
    <div className="card space-y-1">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`text-2xl font-semibold ${highlight ? 'text-neon-400' : 'text-gray-100'} ${negative ? 'text-red-400' : ''}`}>
        ${value?.toFixed(2) ?? '0.00'}
      </p>
    </div>
  );
}

function CardList({ title, items, empty, cardMode }: { title: string; items: any[]; empty: string; cardMode?: boolean }) {
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-gray-500">{empty}</p>}
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg bg-ink-800 px-3 py-2">
            <div>
              <p className="font-medium text-gray-100">{item.name}</p>
              <p className="text-xs text-gray-500">
                {item.member ? `${labelForMember(item.member)} • ` : ''}Due {new Date(item.nextDueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-neon-400 font-semibold">${cardMode ? item.minPayment?.toFixed(2) : item.amount?.toFixed(2)}</p>
              {cardMode && item.balance && <p className="text-xs text-gray-500">Balance ${item.balance.toFixed(2)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Comparison({
  combined,
  summaries
}: {
  combined: { income: number; billTotal: number; cardMinTotal: number; remaining: number };
  summaries: MemberSummary[];
}) {
  const primary = summaries.find((s) => s.member === 'primary');
  const partner = summaries.find((s) => s.member === 'partner');
  const gap =
    primary && partner ? {
      income: primary.income - partner.income,
      remaining: primary.remaining - partner.remaining
    } : { income: 0, remaining: 0 };

  return (
    <div className="card space-y-3 h-full">
      <h3 className="text-lg font-semibold">Household Comparison</h3>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total income" value={combined.income} highlight />
        <Stat label="Total remaining" value={combined.remaining} highlight={combined.remaining >= 0} negative={combined.remaining < 0} />
        <Stat label="Total bills" value={combined.billTotal} />
        <Stat label="Total card mins" value={combined.cardMinTotal} />
      </div>
      {primary && partner && (
        <div className="space-y-2 text-sm text-gray-200">
          <p className="flex justify-between"><span>Income gap (You - Partner)</span><span className={gap.income >= 0 ? 'text-neon-400' : 'text-red-400'}>${gap.income.toFixed(2)}</span></p>
          <p className="flex justify-between"><span>Remaining gap</span><span className={gap.remaining >= 0 ? 'text-neon-400' : 'text-red-400'}>${gap.remaining.toFixed(2)}</span></p>
        </div>
      )}
    </div>
  );
}

function HouseholdCard({ combined }: { combined: { income: number; billTotal: number; cardMinTotal: number; remaining: number } }) {
  return (
    <div className="card space-y-3 lg:col-span-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Household</p>
          <h3 className="text-lg font-semibold">Totals</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total income" value={combined.income} highlight />
        <Stat label="Total bills" value={combined.billTotal} />
        <Stat label="Total card mins" value={combined.cardMinTotal} />
        <Stat label="Total remaining" value={combined.remaining} highlight={combined.remaining >= 0} negative={combined.remaining < 0} />
      </div>
    </div>
  );
}

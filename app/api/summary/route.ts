import { NextResponse } from 'next/server';
import { requireUserSession } from '@/lib/auth';
import { getHouseholdSummary } from '@/lib/summary';

export async function GET() {
  const session = await requireUserSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const summary = await getHouseholdSummary(session.user.id, new Date());
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error('summary error', err);
    return NextResponse.json({ error: 'Failed to load summary', detail: err?.message ?? 'unknown' }, { status: 500 });
  }
}

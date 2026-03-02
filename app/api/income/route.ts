import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserSession } from '@/lib/auth';
import { connectMongo } from '@/lib/mongo';
import { IncomeProfileModel } from '@/models';

const incomeSchema = z.object({
  amount: z.number().nonnegative(),
  member: z.enum(['primary', 'partner']).default('primary')
});

export async function GET() {
  const session = await requireUserSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectMongo();

  const profiles = await IncomeProfileModel.find({ userId: session.user.id });
  const data = ['primary', 'partner'].map((member) => {
    const p = profiles.find((pr) => pr.member === member) ?? profiles.find((pr) => !pr.member && member === 'primary');
    return { member, income: p?.currentIncome ?? 0, effectiveFrom: p?.effectiveFrom ?? null };
  });
  const totalIncome = data.reduce((s, d) => s + (d.income ?? 0), 0);
  return NextResponse.json({ incomes: data, totalIncome });
}

export async function POST(req: Request) {
  const session = await requireUserSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const json = await req.json();
  const parsed = incomeSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const { amount, member } = parsed.data;
  await connectMongo();
  await ensureIncomeIndex();
  const filter = { userId: session.user.id, member };
  const update = {
    $push: { history: { amount, effectiveFrom: new Date().toISOString() } },
    $set: { currentIncome: amount, effectiveFrom: new Date(), member }
  };

  try {
    await IncomeProfileModel.updateOne(filter, update, { upsert: true, strict: true });
  } catch (err: any) {
    if (err?.code === 11000) {
      // drop legacy unique index on userId only, then retry
      await dropLegacyIncomeIndex();
      await IncomeProfileModel.updateOne(filter, update, { upsert: true, strict: true });
    } else {
      throw err;
    }
  }

  return NextResponse.json({ ok: true });
}

let incomeIndexEnsured = false;
async function ensureIncomeIndex() {
  if (incomeIndexEnsured) return;
  await connectMongo();
  try {
    const indexes = await IncomeProfileModel.collection.indexes();
    const legacy = indexes.find((idx: any) => idx.name === 'userId_1');
    if (legacy) {
      await IncomeProfileModel.collection.dropIndex('userId_1');
    }
  } catch (err: any) {
    if (err?.code !== 27) {
      console.warn('ensureIncomeIndex warning', err);
    }
  } finally {
    incomeIndexEnsured = true;
  }
}

async function dropLegacyIncomeIndex() {
  try {
    await IncomeProfileModel.collection.dropIndex('userId_1');
  } catch (err: any) {
    if (err?.code !== 27) console.warn('dropLegacyIncomeIndex warning', err);
  }
}

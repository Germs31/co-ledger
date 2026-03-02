import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserSession } from '@/lib/auth';
import { connectMongo } from '@/lib/mongo';
import { CreditCardModel } from '@/models';

const cardSchema = z.object({
  name: z.string().min(1),
  minPayment: z.number().nonnegative(),
  balance: z.number().nonnegative().optional(),
  dueDate: z.string().datetime(),
  member: z.enum(['primary', 'partner']).default('primary')
});

export async function GET() {
  const session = await requireUserSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectMongo();
  const cards = await CreditCardModel.find({ userId: session.user.id }).sort({ member: 1, nextDueDate: 1 });
  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const session = await requireUserSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = cardSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const { name, minPayment, balance, dueDate, member } = parsed.data;
  const due = new Date(dueDate);
  await connectMongo();
  const created = await CreditCardModel.create({
    userId: session.user.id,
    member,
    name,
    minPayment,
    balance,
    dueDay: due.getUTCDate(),
    nextDueDate: due
  });
  return NextResponse.json(created, { status: 201 });
}

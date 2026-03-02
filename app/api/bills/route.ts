import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserSession } from '@/lib/auth';
import { BillModel } from '@/models';
import { connectMongo } from '@/lib/mongo';

const billSchema = z.object({
  name: z.string().min(1),
  amount: z.number().nonnegative(),
  dueDate: z.string().datetime(),
  category: z.string().min(1),
  member: z.enum(['primary', 'partner']).default('primary')
});

export async function GET() {
  const session = await requireUserSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectMongo();
  const bills = await BillModel.find({ userId: session.user.id }).sort({ member: 1, nextDueDate: 1 });
  return NextResponse.json(bills);
}

export async function POST(req: Request) {
  const session = await requireUserSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = billSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const { name, amount, dueDate, category, member } = parsed.data;
  const due = new Date(dueDate);
  await connectMongo();
  const created = await BillModel.create({
    userId: session.user.id,
    member,
    name,
    amount,
    dueDay: due.getUTCDate(),
    nextDueDate: due,
    category
  });
  return NextResponse.json(created, { status: 201 });
}

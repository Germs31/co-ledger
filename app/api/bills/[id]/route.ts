import { NextResponse } from 'next/server';
import { requireUserSession } from '@/lib/auth';
import { BillModel } from '@/models';
import { connectMongo } from '@/lib/mongo';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await requireUserSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectMongo();

  const bill = await BillModel.findById(params.id);
  if (!bill || bill.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await BillModel.deleteOne({ _id: params.id });
  return NextResponse.json({ ok: true });
}

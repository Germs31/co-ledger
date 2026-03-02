import { NextResponse } from 'next/server';
import { requireUserSession } from '@/lib/auth';
import { connectMongo } from '@/lib/mongo';
import { CreditCardModel } from '@/models';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await requireUserSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectMongo();

  const card = await CreditCardModel.findById(params.id);
  if (!card || card.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await CreditCardModel.deleteOne({ _id: params.id });
  return NextResponse.json({ ok: true });
}

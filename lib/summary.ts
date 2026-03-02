import { BillModel, CreditCardModel, IncomeProfileModel, MonthlySummaryModel } from '@/models';
import { ensureFutureMonth, toMonthKey } from './dates';
import { connectMongo } from './mongo';

function asNumber(value: any) {
  return typeof value === 'number' ? value : Number(value); // Prisma Decimal -> number
}

type Member = 'primary' | 'partner';

function memberFilter(userId: string, member: Member) {
  if (member === 'primary') {
    return { userId, $or: [{ member: 'primary' }, { member: { $exists: false } }] };
  }
  return { userId, member };
}

let summaryIndexEnsured = false;
async function ensureSummaryIndex() {
  if (summaryIndexEnsured) return;
  await connectMongo();
  try {
    const indexes = await MonthlySummaryModel.collection.indexes();
    const legacy = indexes.find((idx: any) => idx.name === 'userId_1_month_1');
    if (legacy) {
      await MonthlySummaryModel.collection.dropIndex('userId_1_month_1');
    }
  } catch (err: any) {
    // if index didn't exist, ignore; otherwise log once
    if (err?.code !== 27) {
      console.warn('ensureSummaryIndex warning', err);
    }
  } finally {
    summaryIndexEnsured = true;
  }
}

async function getSummaryForMember(userId: string, member: Member, target = new Date()) {
  const monthKey = toMonthKey(target);
  await connectMongo();
  await ensureSummaryIndex();

  const incomeProfile = await IncomeProfileModel.findOne(memberFilter(userId, member));
  const income = asNumber(incomeProfile?.currentIncome ?? 0);

  const bills = await BillModel.find({ ...memberFilter(userId, member), active: true });
  const cards = await CreditCardModel.find({ ...memberFilter(userId, member), active: true });

  await Promise.all(
    bills.map(async (bill) => {
      const next = ensureFutureMonth(new Date(bill.nextDueDate), target);
      if (next.getTime() !== new Date(bill.nextDueDate).getTime()) {
        await BillModel.updateOne({ _id: bill._id }, { $set: { nextDueDate: next } });
      }
    })
  );

  await Promise.all(
    cards.map(async (card) => {
      const next = ensureFutureMonth(new Date(card.nextDueDate), target);
      if (next.getTime() !== new Date(card.nextDueDate).getTime()) {
        await CreditCardModel.updateOne({ _id: card._id }, { $set: { nextDueDate: next } });
      }
    })
  );

  const billTotal = bills.reduce((sum, b) => sum + asNumber(b.amount), 0);
  const cardMinTotal = cards.reduce((sum, c) => sum + asNumber(c.minPayment), 0);
  const remaining = income - billTotal - cardMinTotal;

  const upsertData = { income, billTotal, cardMinTotal, remaining, member };

  try {
    await MonthlySummaryModel.updateOne(
      { userId, member, month: monthKey },
      { $set: upsertData },
      { upsert: true, strict: true }
    );
  } catch (err: any) {
    if (err?.code === 11000) {
      // Retry once after dropping legacy index
      summaryIndexEnsured = false;
      await ensureSummaryIndex();
      await MonthlySummaryModel.updateOne(
        { userId, member, month: monthKey },
        { $set: upsertData },
        { upsert: true, strict: true }
      );
    } else {
      throw err;
    }
  }

  return { member, month: monthKey, income, billTotal, cardMinTotal, remaining, bills, cards };
}

export async function getHouseholdSummary(userId: string, target = new Date()) {
  const members: Member[] = ['primary', 'partner'];
  const summaries = await Promise.all(members.map((m) => getSummaryForMember(userId, m, target)));
  const combined = summaries.reduce(
    (acc, s) => {
      acc.income += s.income;
      acc.billTotal += s.billTotal;
      acc.cardMinTotal += s.cardMinTotal;
      acc.remaining += s.remaining;
      return acc;
    },
    { income: 0, billTotal: 0, cardMinTotal: 0, remaining: 0 }
  );
  return { summaries, combined };
}

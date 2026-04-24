import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        student: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedTransactions = transactions.map((t: any) => ({
      id: t.id,
      reference: t.reference,
      student: t.student.name,
      matricNo: t.student.matricNo,
      type: t.type,
      details: t.details || '',
      amount: t.amount,
      dateISO: t.createdAt.toISOString(),
      status: t.status,
      channel: t.channel,
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching admin transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

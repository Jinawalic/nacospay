import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studentId = id;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        student: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedTransactions = transactions.map((t: any) => ({
      id: t.id,
      txnId: t.reference,
      kind: t.type.toLowerCase().includes('merch') ? 'merchandise' : 'dues',
      typeLabel: t.type,
      student: t.student.name,
      matricNo: t.student.matricNo,
      details: t.details || '',
      amount: t.amount,
      dateISO: t.createdAt.toISOString(),
      status: t.status,
      paymentMethod: t.channel,
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching student transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

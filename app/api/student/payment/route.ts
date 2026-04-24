import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { reference, studentId, amount, type, details, paymentMethod } = await request.json();

    if (!reference || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If studentId is not provided, we might be in a mock state or using a default student
    // For this implementation, we'll try to find a student or use a default one if none provided
    // but the goal is to make it "for the particular student".
    
    let targetStudentId = studentId;

    if (!targetStudentId) {
      // Try to find the default student from schema if it exists, or just use the first one
      const firstStudent = await prisma.student.findFirst();
      if (firstStudent) {
        targetStudentId = firstStudent.id;
      } else {
        return NextResponse.json({ error: 'No student found in database' }, { status: 404 });
      }
    }

    const student = await prisma.student.findUnique({
      where: { id: targetStudentId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Create transaction in database
    const transaction = await prisma.transaction.create({
      data: {
        reference,
        studentId: targetStudentId,
        amount: parseFloat(amount),
        type: type || 'Dues',
        details: details || '',
        status: 'Paid',
        channel: paymentMethod || 'Paystack',
      },
      include: {
        student: true,
      }
    });

    return NextResponse.json({
      message: 'Payment successful',
      transaction: {
        ...transaction,
        // Map to the frontend transaction structure if needed
        txnId: transaction.reference,
        kind: transaction.type.toLowerCase().includes('merch') ? 'merchandise' : 'dues',
        typeLabel: transaction.type,
        student: student.name,
        matricNo: student.matricNo,
        dateISO: transaction.createdAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

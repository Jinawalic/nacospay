import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { matricNo, email } = await request.json();

    const student = await prisma.student.findFirst({
      where: { 
        matricNo: {
          equals: matricNo,
          mode: 'insensitive',
        },
        email: {
          equals: email,
          mode: 'insensitive',
        }
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Verify your matric number and email' }, { status: 404 });
    }

    // Reset to default
    await prisma.student.update({
      where: { id: student.id },
      data: {
        password: '12345678',
      },
    });

    return NextResponse.json({ 
      message: 'Account reset successful! Please login with your default password "12345678" and change it immediately.' 
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}

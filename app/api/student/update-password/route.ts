import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { matricNo, newPassword } = await request.json();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const student = await prisma.student.findFirst({
      where: {
        matricNo: {
          equals: matricNo,
          mode: 'insensitive',
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    await prisma.student.update({
      where: { id: student.id },
      data: {
        password: hashedPassword,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set('nacos_student_session', student.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    const { password: _, ...studentData } = student;
    return NextResponse.json({ 
      message: 'Password updated successfully',
      student: studentData 
    });

  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}

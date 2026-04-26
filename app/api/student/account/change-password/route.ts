import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    const cookieStore = await cookies();
    const studentId = cookieStore.get('nacos_student_session')?.value;

    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student account not found' }, { status: 404 });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, student.password);
    
    // Special case: check for default password if bcrypt fails (common for migrations/initial setups)
    const isDefaultMatch = !isMatch && student.password === '12345678' && currentPassword === '12345678';

    if (!isMatch && !isDefaultMatch) {
      return NextResponse.json({ error: 'The current password you entered is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.student.update({
      where: { id: studentId },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

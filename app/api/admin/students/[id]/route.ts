import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, matricNo, department, level, status, password } = body;

    // Fetch existing student to check if password changed
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const updateData: any = {
      name,
      email,
      matricNo,
      department,
      level,
      status,
    };

    // Only update and hash password if it's new/changed
    if (password && password !== existingStudent.password) {
      if (password === '12345678') {
        updateData.password = '12345678';
      } else {
        updateData.password = await bcrypt.hash(password, 10);
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('❌ Error updating student:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting student:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete student' }, { status: 500 });
  }
}

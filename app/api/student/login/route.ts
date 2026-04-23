import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { matricNo, password } = await request.json();

    const student = await prisma.student.findUnique({
      where: { matricNo },
    });

    if (!student) {
      return NextResponse.json({ error: 'Invalid matriculation number' }, { status: 401 });
    }

    // Handle default password '12345678' for first-time login
    // If password in DB is '12345678', and input is '12345678', we allow login to trigger first-login modal
    let isMatch = false;
    if (student.password === '12345678' && password === '12345678') {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, student.password);
    }

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // In a real app, you'd set a cookie/session here.
    // For now, we return the student data (minus password)
    const { password: _, ...studentData } = student;
    return NextResponse.json({ 
      message: 'Login successful', 
      student: studentData,
      isFirstLogin: student.password === '12345678' 
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

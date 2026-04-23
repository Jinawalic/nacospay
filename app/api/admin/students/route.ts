import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { joined: 'desc' },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's bulk or single
    if (Array.isArray(body)) {
      // Bulk upload
      const createdStudents = await prisma.student.createMany({
        data: body.map((s: { 
          name: string; 
          email: string; 
          matricNo: string; 
          department: string; 
          level: string; 
          status?: string;
          password?: string;
        }) => ({
          name: s.name,
          email: s.email,
          matricNo: s.matricNo,
          department: s.department,
          level: s.level,
          status: s.status || 'Active',
          password: s.password || '12345678', // Default password
        })),
        // skipDuplicates: true, // Note: Removed due to Type 'true' is not assignable to type 'never' in this Prisma version
      });
      return NextResponse.json({ message: `${createdStudents.count} students imported successfully`, count: createdStudents.count });
    } else {
      // Single student
      const { name, email, matricNo, department, level } = body;
      
      const existingStudent = await prisma.student.findUnique({
        where: { matricNo },
      });

      if (existingStudent) {
        return NextResponse.json({ error: 'Student with this matric number already exists' }, { status: 400 });
      }

      const student = await prisma.student.create({
        data: {
          name,
          email,
          matricNo,
          department,
          level,
          status: 'Active',
          password: '12345678', // Default password
        },
      });

      return NextResponse.json(student);
    }
  } catch (error) {
    console.error('CRITICAL DATABASE ERROR:', error);
    return NextResponse.json({ 
      error: 'Failed to process request', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

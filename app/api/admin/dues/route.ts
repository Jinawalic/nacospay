import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dues = await prisma.due.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(dues);
  } catch (error) {
    console.error('Error fetching dues:', error);
    return NextResponse.json({ error: 'Failed to fetch dues' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, audience, amount, session, description, status, sizes } = body;

    const due = await prisma.due.create({
      data: {
        title,
        audience,
        amount,
        session,
        description,
        status,
        sizes,
      },
    });

    return NextResponse.json(due, { status: 201 });
  } catch (error) {
    console.error('Error creating due:', error);
    return NextResponse.json({ error: 'Failed to create due' }, { status: 500 });
  }
}

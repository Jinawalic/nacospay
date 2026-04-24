import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, audience, amount, session, description, status, sizes } = body;

    const due = await prisma.due.update({
      where: { id },
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

    return NextResponse.json(due);
  } catch (error) {
    console.error('Error updating due:', error);
    return NextResponse.json({ error: 'Failed to update due' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.due.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Due deleted successfully' });
  } catch (error) {
    console.error('Error deleting due:', error);
    return NextResponse.json({ error: 'Failed to delete due' }, { status: 500 });
  }
}

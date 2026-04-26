import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('nacos_admin_session')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const { password: _, ...adminData } = admin;
    return NextResponse.json(adminData);

  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('nacos_admin_session')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, currentPassword, newPassword } = await request.json();

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const updateData: any = {
      name,
      email,
      phone,
    };

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new one' }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
    });

    const { password: _, ...adminData } = updatedAdmin;
    return NextResponse.json({ message: 'Profile updated successfully', admin: adminData });

  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

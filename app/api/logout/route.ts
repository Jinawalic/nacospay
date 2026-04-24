import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Clear both sessions
  cookieStore.delete('nacos_student_session');
  cookieStore.delete('nacos_admin_session');
  
  return NextResponse.json({ message: 'Logged out successfully' });
}

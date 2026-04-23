export type AdminStudent = {
  id: string;
  name: string;
  matricNo: string;
  email: string;
  department: string;
  level: string;
  status: 'Active' | 'Pending' | 'Inactive';
  joined: string;
};

export type AdminDueItem = {
  id: string;
  title: string;
  audience: string;
  amount: number;
  session: string;
  description: string;
  status: 'Published' | 'Draft';
};

export type AdminTransaction = {
  id: string;
  reference: string;
  student: string;
  matricNo: string;
  type: 'Dues' | 'Merchandise' | 'Event';
  details: string;
  amount: number;
  dateISO: string;
  status: 'Paid' | 'Pending' | 'Failed';
  channel: 'Paystack' | 'Card' | 'Bank Transfer';
};

export const adminStudentsSeed: AdminStudent[] = [
  {
    id: 'student-1',
    name: 'Jinawa Titus',
    matricNo: 'NACOS/CS/24/019',
    email: 'jinawa.titus@nacos.edu.ng',
    department: 'Computer Science',
    level: '300L',
    status: 'Active',
    joined: '2024-09-12',
  },
  {
    id: 'student-2',
    name: 'Amina Musa',
    matricNo: 'NACOS/IT/24/044',
    email: 'amina.musa@nacos.edu.ng',
    department: 'Information Technology',
    level: '200L',
    status: 'Active',
    joined: '2024-09-14',
  },
  {
    id: 'student-3',
    name: 'Daniel Okafor',
    matricNo: 'NACOS/SE/23/107',
    email: 'daniel.okafor@nacos.edu.ng',
    department: 'Software Engineering',
    level: '400L',
    status: 'Pending',
    joined: '2024-10-04',
  },
  {
    id: 'student-4',
    name: 'Maryam Ibrahim',
    matricNo: 'NACOS/CS/22/011',
    email: 'maryam.ibrahim@nacos.edu.ng',
    department: 'Computer Science',
    level: '500L',
    status: 'Active',
    joined: '2024-08-28',
  },
  {
    id: 'student-5',
    name: 'Emmanuel Udo',
    matricNo: 'NACOS/AI/24/061',
    email: 'emmanuel.udo@nacos.edu.ng',
    department: 'Artificial Intelligence',
    level: '100L',
    status: 'Inactive',
    joined: '2024-11-02',
  },
];

export const adminDueSeed: AdminDueItem[] = [
  {
    id: 'due-1',
    title: 'NACOS Annual Dues',
    audience: 'All Levels',
    amount: 5000,
    session: '2024/2025',
    description: 'Annual association dues for full membership access.',
    status: 'Published',
  },
  {
    id: 'due-2',
    title: 'Tech Summit Levy',
    audience: '200L - 500L',
    amount: 2500,
    session: '2024/2025',
    description: 'Covers venue support, logistics, and event materials.',
    status: 'Published',
  },
  {
    id: 'due-3',
    title: 'Freshers Welcome Pack',
    audience: '100L',
    amount: 3500,
    session: '2024/2025',
    description: 'Orientation materials, ID support, and onboarding kit.',
    status: 'Draft',
  },
];

export const adminTransactionsSeed: AdminTransaction[] = [
  {
    id: 'admin-txn-1',
    reference: 'NP-260418-A1',
    student: 'Jinawa Titus',
    matricNo: 'NACOS/CS/24/019',
    type: 'Dues',
    details: '100L, 200L, 300L',
    amount: 15000,
    dateISO: '2026-04-18T10:24:00.000Z',
    status: 'Paid',
    channel: 'Paystack',
  },
  {
    id: 'admin-txn-2',
    reference: 'NP-260410-B2',
    student: 'Amina Musa',
    matricNo: 'NACOS/IT/24/044',
    type: 'Merchandise',
    details: 'T-Shirt / ID Card bundle',
    amount: 8500,
    dateISO: '2026-04-10T15:42:00.000Z',
    status: 'Paid',
    channel: 'Card',
  },
  {
    id: 'admin-txn-3',
    reference: 'NP-260407-C4',
    student: 'Maryam Ibrahim',
    matricNo: 'NACOS/CS/22/011',
    type: 'Dues',
    details: '400L, 500L',
    amount: 10000,
    dateISO: '2026-04-07T09:12:00.000Z',
    status: 'Paid',
    channel: 'Paystack',
  },
  {
    id: 'admin-txn-4',
    reference: 'NP-260405-D7',
    student: 'Daniel Okafor',
    matricNo: 'NACOS/SE/23/107',
    type: 'Event',
    details: 'Tech Summit Levy',
    amount: 2500,
    dateISO: '2026-04-05T13:05:00.000Z',
    status: 'Pending',
    channel: 'Bank Transfer',
  },
  {
    id: 'admin-txn-5',
    reference: 'NP-260401-E2',
    student: 'Emmanuel Udo',
    matricNo: 'NACOS/AI/24/061',
    type: 'Merchandise',
    details: 'Freshers welcome pack',
    amount: 3500,
    dateISO: '2026-04-01T16:48:00.000Z',
    status: 'Failed',
    channel: 'Paystack',
  },
  {
    id: 'admin-txn-6',
    reference: 'NP-260324-F9',
    student: 'Chisom Okeke',
    matricNo: 'NACOS/IT/23/078',
    type: 'Dues',
    details: 'All levels cleared',
    amount: 20000,
    dateISO: '2026-03-24T11:20:00.000Z',
    status: 'Paid',
    channel: 'Paystack',
  },
];

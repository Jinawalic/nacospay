import { adminDueSeed, adminStudentsSeed, adminTransactionsSeed } from './admin-data';
import { AdminOverviewDashboard } from '../components/admin/AdminOverviewDashboard';

export default function AdminOverviewPage() {
  return (
    <AdminOverviewDashboard
      students={adminStudentsSeed}
      dues={adminDueSeed}
      transactions={adminTransactionsSeed}
    />
  );
}

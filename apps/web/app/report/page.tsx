import { redirect } from 'next/navigation';

export default function ReportAliasPage() {
  // Simple alias so /report redirects to the actual tourist report flow
  redirect('/tourist/report');
}

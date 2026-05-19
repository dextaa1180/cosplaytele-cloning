import { AdminShell } from '@/components/admin/AdminShell';

export default function TunaConsoleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}

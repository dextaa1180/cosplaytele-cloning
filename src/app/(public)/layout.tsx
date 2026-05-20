import { PageLayout } from '@/components/layout/PageLayout';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PageLayout>
      <AnalyticsTracker />
      {children}
    </PageLayout>
  );
}

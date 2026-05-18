import { RankingPageLayout } from '@/components/ranking/RankingPageLayout';

export default function Top24HoursPage() {
  return (
    <RankingPageLayout
      title="Top 24 Hours"
      description="Most popular cosplay in the last 24 hours"
      period="24h"
    />
  );
}

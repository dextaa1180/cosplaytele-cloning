import { RankingPageLayout } from '@/components/ranking/RankingPageLayout';

export default function Top7DayPage() {
  return (
    <RankingPageLayout
      title="Top 7 Days"
      description="Most popular cosplay in the last 7 days"
      period="7d"
    />
  );
}

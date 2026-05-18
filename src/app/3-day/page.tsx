import { RankingPageLayout } from '@/components/ranking/RankingPageLayout';

export default function Top3DayPage() {
  return (
    <RankingPageLayout
      title="Top 3 Days"
      description="Most popular cosplay in the last 3 days"
      period="3d"
    />
  );
}

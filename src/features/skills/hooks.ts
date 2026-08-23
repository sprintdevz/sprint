import { useQuery } from '@tanstack/react-query';
import { fetchSkillDetail } from '@/features/skills/api';

export function useSkillDetail(athleteId: string | null, sportId: string, skillCode: string) {
  return useQuery({
    queryKey: ['skill', athleteId, skillCode],
    queryFn: () => fetchSkillDetail(athleteId ?? '', sportId, skillCode),
    enabled: !!athleteId,
    staleTime: 60_000,
  });
}
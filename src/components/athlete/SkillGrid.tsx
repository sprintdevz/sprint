import { View } from 'react-native';
import type { IconName } from '@/types/common';
import { SkillCard } from '@/components/athlete/SkillCard';

export interface SkillGridItem {
  skillCode: string;
  name: string;
  rating: number;
  mastery: number;
  trend: number;
  icon?: IconName;
}

interface SkillGridProps {
  skills: SkillGridItem[];
  onSkillPress?: (skillCode: string) => void;
  /** Codes to emphasize as weakest. */
  weakestCodes?: string[];
  columns?: 1 | 2;
}

/** Responsive skill grid (home screen list or profile grid). */
export function SkillGrid({ skills, onSkillPress, weakestCodes = [], columns = 1 }: SkillGridProps) {
  if (columns === 2) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {skills.map((s) => (
          <View key={s.skillCode} style={{ width: '48%' }}>
            <SkillCard
              name={s.name}
              rating={s.rating}
              mastery={s.mastery}
              trend={s.trend}
              icon={s.icon}
              isWeakest={weakestCodes.includes(s.skillCode)}
              onPress={onSkillPress ? () => onSkillPress(s.skillCode) : undefined}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      {skills.map((s) => (
        <SkillCard
          key={s.skillCode}
          name={s.name}
          rating={s.rating}
          mastery={s.mastery}
          trend={s.trend}
          icon={s.icon}
          isWeakest={weakestCodes.includes(s.skillCode)}
          onPress={onSkillPress ? () => onSkillPress(s.skillCode) : undefined}
        />
      ))}
    </View>
  );
}
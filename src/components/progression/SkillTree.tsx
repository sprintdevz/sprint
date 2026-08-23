import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SkillNode, type SkillNodeProps } from '@/components/progression/SkillNode';

export interface SkillTreeNode extends Omit<SkillNodeProps, 'onPress'> {
  skillCode: string;
}

interface SkillTreeProps {
  nodes: SkillTreeNode[];
  onNodePress?: (skillCode: string) => void;
}

/** Two-column skill tree view — visual graph of progression stages. */
export function SkillTree({ nodes, onNodePress }: SkillTreeProps) {
  const { spacing } = useTheme();
  const left = nodes.filter((_, i) => i % 2 === 0);
  const right = nodes.filter((_, i) => i % 2 === 1);

  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.columns}>
        <View style={styles.column}>
          {left.map((n) => (
            <SkillNode key={n.skillCode} {...n} onPress={onNodePress ? () => onNodePress(n.skillCode) : undefined} />
          ))}
        </View>
        <View style={styles.column}>
          {right.map((n) => (
            <SkillNode key={n.skillCode} {...n} onPress={onNodePress ? () => onNodePress(n.skillCode) : undefined} />
          ))}
        </View>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 12 },
  column: { flex: 1, gap: 12 },
});
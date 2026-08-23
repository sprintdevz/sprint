import type { ReactNode } from 'react';
import Svg, { Path, Circle, Ellipse, G } from 'react-native-svg';

/**
 * CHEETAH — SPRINT's mascot.
 *
 * A hand-drawn (vector) cartoon cheetah: athletic, confident, playful.
 * Built from primitive SVG shapes so it renders crisply at any size and
 * dark-mode proof (uses fixed brand colors).
 *
 * Expressions:
 *   happy        — default, confident smile
 *   excited      — wide eyes, open-mouth grin, ears up
 *   focused      — determined narrow eyes, slight frown
 *   surprised    — round eyes, O mouth
 *   determined   — squint, gritted smile
 *   celebrating  — big grin + closed happy eyes
 */

export type CheetahExpression =
  | 'happy'
  | 'excited'
  | 'focused'
  | 'surprised'
  | 'determined'
  | 'celebrating';

export interface CheetahProps {
  size?: number;
  expression?: CheetahExpression;
  /** Optional pose flag — running adds motion streaks. */
  pose?: 'idle' | 'running';
}

const SPOTS = [
  [18, 30, 3.2], [30, 22, 3], [14, 44, 3], [24, 40, 2.8], [70, 22, 3.2],
  [62, 30, 3], [78, 34, 3], [92, 26, 3], [84, 44, 2.6], [56, 24, 2.6],
] as const;

function eyePath(expression: CheetahExpression, cx: number, cy: number, r: number): ReactNode {
  switch (expression) {
    case 'celebrating':
      // Happy closed eyes: arcs.
      return (
        <Path
          d={`M ${cx - r} ${cy} Q ${cx} ${cy + r - 2} ${cx + r} ${cy}`}
          stroke="#0B1B3A"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      );
    case 'focused':
    case 'determined':
      return (
        <G>
          <Ellipse cx={cx} cy={cy} rx={r * 0.55} ry={r} fill="#FFFFFF" />
          <Circle cx={cx} cy={cy + 1} r={r * 0.42} fill="#0B1B3A" />
          <Circle cx={cx} cy={cy + 1} r={r * 0.16} fill="#FFFFFF" />
        </G>
      );
    case 'surprised':
    case 'excited':
      return (
        <G>
          <Circle cx={cx} cy={cy} r={r} fill="#FFFFFF" />
          <Circle cx={cx} cy={cy + 0.5} r={r * 0.55} fill="#0B1B3A" />
          <Circle cx={cx} cy={cy} r={r * 0.2} fill="#FFFFFF" />
        </G>
      );
    default:
      return (
        <G>
          <Ellipse cx={cx} cy={cy} rx={r * 0.8} ry={r * 0.72} fill="#FFFFFF" />
          <Circle cx={cx} cy={cy + 0.5} r={r * 0.38} fill="#0B1B3A" />
          <Circle cx={cx} cy={cy} r={r * 0.14} fill="#FFFFFF" />
        </G>
      );
  }
}

/** Hand-drawn cheetah head + shoulders. Use in hero, session, results. */
export function Cheetah({ size = 120, expression = 'happy', pose = 'idle' }: CheetahProps) {
  const wide = expression === 'surprised' || expression === 'celebrating';
  const mouthOpen = expression === 'surprised' || expression === 'excited';
  const grinUp = expression === 'celebrating' || expression === 'happy';

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      {pose === 'running' && (
        <G>
          <Path d="M 6 52 Q 16 44 24 50" stroke="#5B8CFF" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M 2 62 Q 14 56 24 60" stroke="#2E6BFF" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M 96 88 Q 104 82 112 86" stroke="#FF9A4D" strokeWidth={3} strokeLinecap="round" fill="none" />
        </G>
      )}

      {/* Ears */}
      <Path d="M 22 40 L 26 18 Q 34 24 38 34 Z" fill="#FF7A1A" />
      <Path d="M 26 36 L 28 24 Q 33 28 35 34 Z" fill="#FFB27A" />
      <Path d="M 98 40 L 94 18 Q 86 24 82 34 Z" fill="#FF7A1A" />
      <Path d="M 94 36 L 92 24 Q 87 28 85 34 Z" fill="#FFB27A" />

      {/* Head */}
      <Path
        d="M 60 16 C 34 16 18 32 18 52 C 18 78 34 96 60 96 C 86 96 102 78 102 52 C 102 32 86 16 60 16 Z"
        fill="#FF9A4D"
      />
      <Path
        d="M 60 20 C 38 20 24 34 24 52 C 24 74 38 92 60 92 C 82 92 96 74 96 52 C 96 34 82 20 60 20 Z"
        fill="#FFB26B"
      />

      {/* Tears (dark mascara lines) */}
      <Path d="M 42 38 Q 46 33 50 36" stroke="#B3530C" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <Path d="M 70 36 Q 74 33 78 38" stroke="#B3530C" strokeWidth={3.5} strokeLinecap="round" fill="none" />

      {/* Spots */}
      {SPOTS.map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill="#E56200" opacity={0.85} />
      ))}

      {/* Muzzle */}
      <Ellipse cx={60} cy={76} rx={26} ry={14} fill="#FFE3C2" />

      {/* Nose */}
      <Path d="M 54 70 Q 60 60 66 70 L 60 74 Z" fill="#0B1B3A" />
      <Path d="M 60 74 L 60 80" stroke="#0B1B3A" strokeWidth={2} strokeLinecap="round" />

      {/* Mouth */}
      {mouthOpen ? (
        <Ellipse cx={60} cy={84} rx={9} ry={7} fill="#7A2E0E" />
      ) : (
        <Path
          d={grinUp ? 'M 50 82 Q 60 90 70 82' : 'M 52 82 Q 60 86 68 82'}
          stroke="#0B1B3A"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Eyes */}
      {eyePath(expression, 44, 56, wide ? 7 : 6)}
      {eyePath(expression, 76, 56, wide ? 7 : 6)}

      {/* Determined brow */}
      {expression === 'determined' && (
        <Path d="M 32 48 L 54 52 M 88 48 L 66 52" stroke="#0B1B3A" strokeWidth={4} strokeLinecap="round" />
      )}
      {expression === 'focused' && (
        <Path d="M 36 50 L 52 48 M 84 50 L 68 48" stroke="#0B1B3A" strokeWidth={3.5} strokeLinecap="round" />
      )}
      {expression === 'surprised' && (
        <G>
          <Path d="M 38 44 Q 44 40 50 44" stroke="#0B1B3A" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M 70 44 Q 76 40 82 44" stroke="#0B1B3A" strokeWidth={3} strokeLinecap="round" fill="none" />
        </G>
      )}

      {/* Cheeks */}
      <Ellipse cx={34} cy={72} rx={6} ry={4} fill="#FF8FA3" opacity={0.5} />
      <Ellipse cx={86} cy={72} rx={6} ry={4} fill="#FF8FA3" opacity={0.5} />
    </Svg>
  );
}
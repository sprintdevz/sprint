import type { CheetahExpression } from '@/components/mascot/Cheetah';

/**
 * Expression picker — maps emotional states to cheetah expressions.
 * Use in copywriting: "the mascot should react to what just happened".
 */
const EXPRESSION_FOR: Record<string, CheetahExpression> = {
  default: 'happy',
  win: 'celebrating',
  streak: 'excited',
  loading: 'focused',
  thinking: 'focused',
  newAchievement: 'celebrating',
  closeCall: 'surprised',
  warning: 'surprised',
  grind: 'determined',
  offDay: 'determined',
  rival: 'determined',
};

export function expressionFor(key: string): CheetahExpression {
  return EXPRESSION_FOR[key] ?? 'happy';
}

/** Copy snippets that pair with expressions. */
export const EXPRESSION_COPY: Record<CheetahExpression, string> = {
  happy: "Let's get to work.",
  excited: 'That was clean. More of that.',
  focused: 'Heads up. Next rep is the one.',
  surprised: "Didn't see that coming. Neither did they.",
  determined: 'One more. Then one more.',
  celebrating: 'That deserves a celebration.',
};
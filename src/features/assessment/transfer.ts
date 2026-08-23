import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AssessmentResult } from '@/features/assessment/types';

const KEY = 'sprint.pending.assessment-result';

/** Store the just-completed assessment result for the results screen. */
export async function stageAssessmentResult(result: AssessmentResult): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    // non-fatal
  }
}

export async function consumeStagedAssessmentResult(): Promise<AssessmentResult | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(KEY);
    return JSON.parse(raw) as AssessmentResult;
  } catch {
    return null;
  }
}
import { DAYS, MEALS, type Choice, type MealVote, type VoteKey, type VoteMap, type VoteValue } from "@/types/voting";
import type { Json } from "@/integrations/supabase/types";

export const NEUTRAL_VOTE: MealVote = { A: 0, B: 0 };
export const VALID_VOTE_VALUES: VoteValue[] = [-1, 0, 1];
export const ALL_VOTE_KEYS: VoteKey[] = DAYS.flatMap((day) =>
  MEALS.map((meal) => `${day}_${meal}` as VoteKey),
);

export function isVoteValue(value: unknown): value is VoteValue {
  return value === -1 || value === 0 || value === 1;
}

export function normalizeMealVote(input: unknown): MealVote {
  if (input === "A") {
    return { A: 1, B: 0 };
  }

  if (input === "B") {
    return { A: 0, B: 1 };
  }

  if (input && typeof input === "object" && !Array.isArray(input)) {
    const record = input as Record<string, unknown>;

    return {
      A: isVoteValue(record.A) ? record.A : 0,
      B: isVoteValue(record.B) ? record.B : 0,
    };
  }

  return { ...NEUTRAL_VOTE };
}

export function normalizeVoteMap(input: Json | Record<string, unknown> | null | undefined): VoteMap {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  return Object.entries(input).reduce<VoteMap>((acc, [key, value]) => {
    acc[key] = normalizeMealVote(value);
    return acc;
  }, {});
}

export function serializeVoteMap(votes: VoteMap): Json {
  return Object.entries(votes).reduce<Record<string, MealVote>>((acc, [key, value]) => {
    acc[key] = normalizeMealVote(value);
    return acc;
  }, {});
}

export function getMealVote(votes: VoteMap, key: string): MealVote {
  return normalizeMealVote(votes[key]);
}

export function hasPositiveSelection(vote: MealVote): boolean {
  return vote.A === 1 || vote.B === 1;
}

export function countCompletedMeals(votes: VoteMap): number {
  return ALL_VOTE_KEYS.filter((key) => hasPositiveSelection(getMealVote(votes, key))).length;
}

export function updateMealVote(votes: VoteMap, key: string, choice: Choice, value: VoteValue): VoteMap {
  return {
    ...votes,
    [key]: {
      ...getMealVote(votes, key),
      [choice]: value,
    },
  };
}

export function getMissingPositiveMeals(votes: VoteMap): VoteKey[] {
  return ALL_VOTE_KEYS.filter((key) => !hasPositiveSelection(getMealVote(votes, key)));
}

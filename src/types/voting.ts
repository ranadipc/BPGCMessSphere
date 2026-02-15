export type Meal = "BRE" | "LUN" | "SNA" | "DIN";
export type Day = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
export type Choice = "A" | "B";

export type VoteKey = `${Day}_${Meal}`;
export type VoteMap = Record<string, Choice>;

export const DAYS: Day[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
export const DAY_LABELS: Record<Day, string> = {
  MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday",
  FRI: "Friday", SAT: "Saturday", SUN: "Sunday",
};
export const DAY_SHORT: Record<Day, string> = {
  MON: "M", TUE: "T", WED: "W", THU: "T", FRI: "F", SAT: "S", SUN: "S",
};
export const MEALS: Meal[] = ["BRE", "LUN", "SNA", "DIN"];
export const MEAL_LABELS: Record<Meal, string> = {
  BRE: "Breakfast", LUN: "Lunch", SNA: "Snacks", DIN: "Dinner",
};

export const TOTAL_VOTES = 28;

export interface Settings {
  voting_open: boolean;
  current_month: string;
}

export interface VoteRow {
  id: string;
  user_id: string;
  month: string;
  mess: string;
  year: string;
  votes: VoteMap;
  status: "draft" | "submitted";
  created_at: string;
  updated_at: string;
}

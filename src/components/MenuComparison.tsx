import { type Day, MEALS, type VoteMap, type Choice } from "@/types/voting";
import MealSection from "./MealSection";

interface Props {
  day: Day;
  votes: VoteMap;
  onVote: (key: string, choice: Choice) => void;
  disabled: boolean;
}

export default function MenuComparison({ day, votes, onVote, disabled }: Props) {
  return (
    <div className="grid gap-3 animate-fade-in">
      {MEALS.map((meal) => {
        const key = `${day}_${meal}`;
        return (
          <MealSection
            key={key}
            meal={meal}
            voteKey={key}
            currentChoice={votes[key]}
            onChoose={(choice) => onVote(key, choice)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}

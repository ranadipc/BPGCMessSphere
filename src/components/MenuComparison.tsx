import { type Choice, type VoteMap, type VoteValue, MEALS } from "@/types/voting";
import { getMealVote } from "@/lib/voteUtils";
import MealSection from "./MealSection";

interface Props {
  day: string;
  menuA: any;
  menuB: any;
  votes: VoteMap;
  onVote: (key: string, choice: Choice, value: VoteValue) => void;
  disabled?: boolean;
}


export default function MenuComparison({ day, menuA, menuB, votes, onVote, disabled }: Props) {
  return (
    <div className="grid gap-3 animate-fade-in">
      {MEALS.map((meal) => {
        const key = `${day}_${meal}`;
  
        const itemsA = menuA?.[day]?.[meal] || [];
        const itemsB = menuB?.[day]?.[meal] || [];
  
        return (
          <MealSection
            key={key}
            meal={meal}
            currentVote={getMealVote(votes, key)}
            menuAItems={itemsA}
            menuBItems={itemsB}
            onChoose={(choice, value) => onVote(key, choice, value)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
  
}

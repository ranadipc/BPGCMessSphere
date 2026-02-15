import { type Day, MEALS, type VoteMap, type Choice } from "@/types/voting";
import MealSection from "./MealSection";

interface Props {
  day: string;
  menuA: any;
  menuB: any;
  votes: Record<string, string>;
  onVote: (key: string, choice: "A" | "B") => void;
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
            voteKey={key}
            currentChoice={votes[key]}
            menuAItems={itemsA}
            menuBItems={itemsB}
            onChoose={(choice) => onVote(key, choice)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
  
}

import { type Meal, type Choice, MEAL_LABELS } from "@/types/voting";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  meal: Meal;
  voteKey: string;
  currentChoice: Choice | undefined;
  onChoose: (choice: Choice) => void;
  disabled: boolean;
}

export default function MealSection({ meal, currentChoice, onChoose, disabled }: Props) {
  return (
    <div className="glass-card p-4 space-y-3">
      <h4 className="font-display font-semibold text-foreground text-sm">
        {MEAL_LABELS[meal]}
      </h4>
      <div className="flex gap-2">
        {(["A", "B"] as Choice[]).map((choice) => {
          const isSelected = currentChoice === choice;
          return (
            <button
              key={choice}
              onClick={() => !disabled && onChoose(choice)}
              disabled={disabled}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg font-display font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2",
                isSelected
                  ? choice === "A"
                    ? "bg-primary text-primary-foreground neon-glow"
                    : "bg-accent text-accent-foreground accent-glow"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSelected && <Check className="w-4 h-4" />}
              Menu {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}

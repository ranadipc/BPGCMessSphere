import { type Choice, type Meal, type MealVote, type VoteValue, MEAL_LABELS } from "@/types/voting";
import { cn } from "@/lib/utils";
import { Check, Circle, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Props {
  meal: string;
  currentVote?: MealVote;
  menuAItems: string[];
  menuBItems: string[];
  onChoose: (choice: Choice, value: VoteValue) => void;
  disabled?: boolean;
}

export default function MealSection(
  { meal, currentVote, menuAItems, menuBItems, onChoose, disabled }: Props
)
 {
  const controls: { value: VoteValue; detail: string; icon: typeof Check }[] = [
    { value: 1, detail: "+1 Point", icon: Check },
    { value: 0, detail: "Neutral", icon: Circle },
    { value: -1, detail: "-1 Point", icon: X },
  ];

  const vote = currentVote ?? { A: 0, B: 0 };
  const handleChoice = (choice: Choice, value: VoteValue) => {
    const otherChoice: Choice = choice === "A" ? "B" : "A";

    if (value === -1 && vote[otherChoice] === -1) {
      toast({
        title: "Invalid choice",
        description: "You can't select cross for both menus in the same meal.",
      });
      return;
    }

    onChoose(choice, value);
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <h4 className="text-center font-display text-base font-semibold text-foreground">
        {MEAL_LABELS[meal]}
      </h4>
  
      {/* MENU CONTENT */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-muted/30 p-3 rounded-lg space-y-1">
          <p className="font-semibold text-primary text-xs">Menu A</p>
          {menuAItems?.length > 0 ? (
            menuAItems.map((item) => (
              <p key={item} className="text-muted-foreground">
                {item}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground text-xs">No items</p>
          )}
        </div>
  
        <div className="bg-muted/30 p-3 rounded-lg space-y-1">
          <p className="font-semibold text-accent text-xs">Menu B</p>
          {menuBItems?.length > 0 ? (
            menuBItems.map((item) => (
              <p key={item} className="text-muted-foreground">
                {item}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground text-xs">No items</p>
          )}
        </div>
      </div>
  
      <div className="grid grid-cols-2 gap-3">
        {(["A", "B"] as Choice[]).map((choice) => (
          <div key={choice} className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <p className={cn("text-xs font-semibold", choice === "A" ? "text-primary" : "text-accent")}>
                Menu {choice}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {vote[choice] === 1 ? "Positive" : vote[choice] === -1 ? "Negative" : "Neutral"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {controls.map(({ value, detail, icon: Icon }) => {
                const selected = vote[choice] === value;
                const otherChoice: Choice = choice === "A" ? "B" : "A";
                const crossBlocked = value === -1 && vote[otherChoice] === -1 && !selected;

                return (
                  <button
                    key={`${choice}-${value}`}
                    type="button"
                    onClick={() => !disabled && !crossBlocked && handleChoice(choice, value)}
                    disabled={disabled || crossBlocked}
                    className={cn(
                      "flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-display font-medium transition-all duration-200",
                      selected && value === 1 && "bg-primary text-primary-foreground neon-glow",
                      selected && value === 0 && "bg-accent text-accent-foreground accent-glow",
                      selected && value === -1 && "bg-destructive text-destructive-foreground",
                      !selected && "bg-muted/60 text-muted-foreground hover:bg-muted",
                      (disabled || crossBlocked) && "opacity-50 cursor-not-allowed",
                    )}
                    title={crossBlocked ? "Cross is already selected on the other menu for this meal." : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] opacity-90">{detail}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {(vote.A === -1 || vote.B === -1) && (
        <p className="text-center text-[11px] text-muted-foreground">
          Only one menu can be crossed for a meal.
        </p>
      )}
    </div>
  );
  
}

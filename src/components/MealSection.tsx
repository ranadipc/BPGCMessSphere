import { type Choice, type Meal, type MealVote, type VoteValue, MEAL_LABELS } from "@/types/voting";
import { cn } from "@/lib/utils";
import { Check, Circle, X } from "lucide-react";

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
  const controls: { value: VoteValue; label: string; detail: string; icon: typeof Check }[] = [
    { value: 1, label: "Tick", detail: "+1 Points", icon: Check },
    { value: 0, label: "O", detail: "Neutral", icon: Circle },
    { value: -1, label: "Cross", detail: "-1 Points", icon: X },
  ];

  const vote = currentVote ?? { A: 0, B: 0 };

  return (
    <div className="glass-card p-4 space-y-3">
      <h4 className="font-display font-semibold text-foreground text-sm">
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
              {controls.map(({ value, label, detail, icon: Icon }) => {
                const selected = vote[choice] === value;

                return (
                  <button
                    key={`${choice}-${value}`}
                    type="button"
                    onClick={() => !disabled && onChoose(choice, value)}
                    disabled={disabled}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-xs font-display font-medium transition-all duration-200",
                      selected &&
                        value === 1 &&
                        (choice === "A" ? "bg-primary text-primary-foreground neon-glow" : "bg-accent text-accent-foreground accent-glow"),
                      selected && value === 0 && "bg-secondary text-secondary-foreground",
                      selected && value === -1 && "bg-destructive text-destructive-foreground",
                      !selected && "bg-muted/60 text-muted-foreground hover:bg-muted",
                      disabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <Icon className="h-3.5 w-3.5" />
                      <span>{label}</span>
                    </div>
                    <span className="text-[10px] opacity-90">{detail}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
}

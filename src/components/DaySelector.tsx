import { DAYS, DAY_SHORT, DAY_LABELS, type Day } from "@/types/voting";
import { cn } from "@/lib/utils";

interface Props {
  selected: Day;
  onSelect: (day: Day) => void;
  completedDays: Day[];
}

export default function DaySelector({ selected, onSelect, completedDays }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {DAYS.map((day, i) => {
        const isSelected = day === selected;
        const isComplete = completedDays.includes(day);
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={cn(
              "flex flex-col items-center min-w-[3rem] px-3 py-2 rounded-lg transition-all duration-200 font-display text-sm font-medium",
              isSelected
                ? "bg-primary text-primary-foreground neon-glow"
                : isComplete
                ? "bg-accent/20 text-accent border border-accent/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            title={DAY_LABELS[day]}
          >
            <span className="text-xs opacity-70">{DAY_SHORT[day]}</span>
            <span>{day}</span>
            {isComplete && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />}
          </button>
        );
      })}
    </div>
  );
}

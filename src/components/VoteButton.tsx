import { TOTAL_VOTES } from "@/types/voting";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

interface Props {
  voteCount: number;
  onSubmit: () => void;
  disabled: boolean;
}

export default function VoteButton({ voteCount, onSubmit, disabled }: Props) {
  const ready = voteCount >= TOTAL_VOTES;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-display font-semibold text-primary">
          {voteCount}/{TOTAL_VOTES}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
          style={{ width: `${(voteCount / TOTAL_VOTES) * 100}%` }}
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={!ready || disabled}
        className={cn(
          "w-full py-3 rounded-lg font-display font-semibold flex items-center justify-center gap-2 transition-all duration-300",
          ready && !disabled
            ? "bg-primary text-primary-foreground neon-glow hover:scale-[1.02] active:scale-[0.98]"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        <Send className="w-4 h-4" />
        Submit All Votes
      </button>
    </div>
  );
}

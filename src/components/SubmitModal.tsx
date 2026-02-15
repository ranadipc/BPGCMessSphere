import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SubmitModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-primary/20 text-center max-w-md">
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle2 className="w-16 h-16 text-primary animate-pulse-neon" />
          <h2 className="text-xl font-display font-bold text-foreground">
            Thanks for your valuable contribution!
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This data will help us decide this month's menu.
          </p>
          <div className="mt-4 pt-4 border-t border-border/30 w-full text-center">
            <p className="text-xs text-muted-foreground">Developed by</p>
            <p className="text-sm font-display font-semibold text-primary">
              Ranadip Chakraborty
            </p>
            <p className="text-xs text-muted-foreground">Mess Convener</p>
          </div>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-display font-medium hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

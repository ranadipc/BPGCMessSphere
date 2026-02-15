import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-border/30 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-primary neon-text tracking-tight">
          BPGCMenuSphere
        </h1>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

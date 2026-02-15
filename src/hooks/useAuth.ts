import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const ALLOWED_DOMAIN = "@goa.bits-pilani.ac.in";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
  
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
  
      if (!mounted) return;
  
      if (currentUser && !currentUser.email?.endsWith(ALLOWED_DOMAIN)) {
        await supabase.auth.signOut();
        setUser(null);
        setError(`Only ${ALLOWED_DOMAIN} emails are allowed.`);
      } else {
        setUser(currentUser);
        setError(null);
  
        if (currentUser) {
          await supabase.from("users").upsert({
            id: currentUser.id,
            email: currentUser.email,
          });
          
        }
      }
  
      setLoading(false);
    };
  
    init();
  
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
  
        if (!mounted) return;
  
        if (currentUser && !currentUser.email?.endsWith(ALLOWED_DOMAIN)) {
          await supabase.auth.signOut();
          setUser(null);
          setError(`Only ${ALLOWED_DOMAIN} emails are allowed.`);
        } else {
          setUser(currentUser);
          setError(null);
        }
      }
    );
  
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);
  

  const signInWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          hd: "goa.bits-pilani.ac.in",
        },
      },
    });
    if (error) setError(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, error, signInWithGoogle, signOut };
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const ALLOWED_DOMAIN = "@goa.bits-pilani.ac.in";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;

        if (currentUser && !currentUser.email?.endsWith(ALLOWED_DOMAIN)) {
          setError(`Only ${ALLOWED_DOMAIN} emails are allowed.`);
          await supabase.auth.signOut();
          setUser(null);
          setLoading(false);
          return;
        }

        setError(null);
        setUser(currentUser);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      if (currentUser && !currentUser.email?.endsWith(ALLOWED_DOMAIN)) {
        supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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

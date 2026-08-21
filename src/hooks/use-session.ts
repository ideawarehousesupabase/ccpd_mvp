import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { readSession, type SessionUser } from "@/lib/auth";

export function useSession() {
  const queryClient = useQueryClient();

  const { data: user, isSuccess } = useQuery({
    queryKey: ["ccpd-session"],
    queryFn: readSession,
    staleTime: Infinity, // Prevent refetching on every remount
  });

  useEffect(() => {
    const sync = () => {
      queryClient.invalidateQueries({ queryKey: ["ccpd-session"] });
    };
    window.addEventListener("ccpd-session", sync);
    return () => window.removeEventListener("ccpd-session", sync);
  }, [queryClient]);

  return { user: user ?? null, ready: isSuccess };
}
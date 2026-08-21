import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import {
  getComplaintBundle,
  getDashboardMetrics,
  getReportSnapshot,
  listActions,
  listComplaints,
  listPackaging,
  listRecommendations,
  listRootCauses,
} from "@/lib/ccpd-store";

export function useUserId() {
  const { user, ready } = useSession();
  return { userId: user?.id ?? null, ready };
}

function useUserQuery<T>(key: string, fn: (userId: string) => Promise<T>) {
  const { userId, ready } = useUserId();
  const query = useQuery({
    queryKey: ["ccpd", key, userId],
    queryFn: () => fn(userId!),
    enabled: Boolean(userId),
  });
  return { ...query, userId, sessionReady: ready };
}

export const useComplaints = () => useUserQuery("complaints", listComplaints);
export const useRootCauses = () => useUserQuery("rootCauses", listRootCauses);
export const useRecommendations = () => useUserQuery("recommendations", listRecommendations);
export const useActions = () => useUserQuery("actions", listActions);
export const usePackaging = () => useUserQuery("packaging", listPackaging);
export const useDashboardMetrics = () => useUserQuery("metrics", getDashboardMetrics);
export const useReportSnapshot = () => useUserQuery("reports", getReportSnapshot);

export function useComplaintBundle(complaintId: string) {
  const { userId, ready } = useUserId();
  const query = useQuery({
    queryKey: ["ccpd", "complaint", userId, complaintId],
    queryFn: () => getComplaintBundle(userId!, complaintId),
    enabled: Boolean(userId),
  });
  return { ...query, userId, sessionReady: ready };
}

/** Refreshes every CCPD dataset after a write. */
export function useRefreshCcpd() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["ccpd"] });
}

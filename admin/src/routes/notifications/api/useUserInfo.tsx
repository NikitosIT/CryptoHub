import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

export function useProfilesList() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: () => api.admin.listProfiles(),
  });
}

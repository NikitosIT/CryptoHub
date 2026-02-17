import { UserInfo } from "@/api";

export function filterProfiles(
  profiles: UserInfo[],
  query: string,
): UserInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return profiles;
  return profiles.filter(
    (p) =>
      (p.nickname ?? "").toLowerCase().includes(q) ||
      (p.id ?? "").toLowerCase().includes(q),
  );
}

export type UserInfo = {
  id: string | null;
  nickname: string | null;
  profile_logo: string | null;
};

export function filterProfiles(profiles: UserInfo[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return profiles;
  return profiles.filter(
    (p) =>
      (p.nickname ?? '').toLowerCase().includes(q) ||
      (p.id ?? '').toLowerCase().includes(q),
  );
}

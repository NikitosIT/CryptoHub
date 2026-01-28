import { USER_AVATARS_BUCKET, USER_LOGO_PREFIX } from "@/constants/storage";

export const getPublicAvatarUrl = (uuid: string) => {
    const base =
        `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public`;
    return `${base}/${USER_AVATARS_BUCKET}/${USER_LOGO_PREFIX}${uuid}.png`;
};

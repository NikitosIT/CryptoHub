import { useState } from "react";
import { Avatar, Button, Box } from "@mui/material";
import { supabase } from "@/lib/supabaseClient";
import { useUserProfile } from "@/api/user/useUserProfile";
import { useUpdateProfile } from "@/api/profile/useUpdateProfile";
import { useSession } from "@/api/user/useSession";
import {
  USER_AVATARS_BUCKET,
  USER_LOGO_PREFIX,
  getPublicAvatarUrl,
} from "@/constants/storage";

export default function ProfileLogo() {
  const session = useSession();
  const user = session?.user ?? null;
  const userId = user?.id;
  const { data: profile } = useUserProfile(userId);
  const saveProfileLogo = useUpdateProfile(userId);
  const [uploading, setUploading] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const encryption = crypto.randomUUID();
    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from(USER_AVATARS_BUCKET)
        .upload(`${USER_LOGO_PREFIX}${encryption}.png`, file, { upsert: true });
      if (uploadError) throw uploadError;

      // Store only UUID in DB
      await saveProfileLogo.mutateAsync({ profile_logo: encryption });
    } catch (err: any) {
      console.error("Ошибка при загрузке:", err.message);
      alert("Не удалось загрузить фото 😕");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Avatar
        src={
          profile?.profile_logo ? getPublicAvatarUrl(profile.profile_logo) : ""
        }
        alt="Avatar"
        sx={{ width: 80, height: 80, border: "2px solid #fbbf24" }}
      >
        Avatar
      </Avatar>

      <Button variant="outlined" component="label" disabled={uploading}>
        {uploading ? "Загрузка..." : "Изменить фото"}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleLogoChange}
        />
      </Button>
    </Box>
  );
}

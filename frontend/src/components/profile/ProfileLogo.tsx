import { useState } from "react";
import { Avatar, Button, Box } from "@mui/material";
import { useUserStore } from "@/store/useUserStore";
import { supabase } from "@/lib/supabaseClient";
import { useUpdateProfile } from "@/api/profile/useUpdateProfile";

export default function ProfileLogo() {
  const { user, profile_logo, setProfileLogo } = useUserStore();
  const saveProfileLogo = useUpdateProfile();
  const [uploading, setUploading] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const encryption = crypto.randomUUID();
    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from("user_avatars")
        .upload(`logos/${encryption}.png`, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("user_avatars")
        .getPublicUrl(`logos/${encryption}.png`);
      const publicUrl = `${urlData.publicUrl}`;

      await saveProfileLogo.mutateAsync({ profile_logo: publicUrl });

      setProfileLogo(publicUrl);
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
        src={profile_logo || ""}
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

import { api } from "@/api";
import { useToast } from "@/hooks/useToast";
import { useUpdateProfile } from "@/routes/profile/-api/useUpdateProfile";
import { getErrorMessage } from "@/utils/errorUtils";
import { generateUUID } from "@/utils/uuid";

export function useUploadProfileLogo(userId?: string) {
  const saveProfileLogo = useUpdateProfile(userId);
  const { showError } = useToast();

  const uploadLogo = async (file: File) => {
    if (!userId) {
      const errorMessage = "User not found";
      showError(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const encryption = generateUUID();

      await api.profile.uploadLogo(userId, file, encryption);

      await saveProfileLogo.mutateAsync({ profile_logo: encryption });
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Upload failed.");
      showError(errorMessage);
      throw err;
    }
  };

  return {
    uploadLogo,
    isUploading: saveProfileLogo.isPending,
  };
}

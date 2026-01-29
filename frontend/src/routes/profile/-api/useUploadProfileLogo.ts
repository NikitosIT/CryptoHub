import { api } from "@/api";
import { useRequiredAuth } from "@/hooks/useRequiredAuth";
import { useToast } from "@/hooks/useToast";
import { useUpdateProfile } from "@/routes/profile/-api/useUpdateProfile";
import { getErrorMessage } from "@/utils/errorUtils";
import { generateUUID } from "@/utils/uuid";

export function useUploadProfileLogo() {
  const { userId } = useRequiredAuth();
  const saveProfileLogo = useUpdateProfile();
  const { showError } = useToast();

  const uploadLogo = async (file: File) => {
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

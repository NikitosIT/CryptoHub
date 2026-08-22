import { api } from '@/api';
import { useToast } from '@/hooks/useToast';
import { useUpdateProfile } from '@/routes/profile/-api/useUpdateProfile';
import { getErrorMessage } from '@/utils/errorUtils';

export function useUploadProfileLogo() {
  const saveProfileLogo = useUpdateProfile();
  const { showError } = useToast();

  const uploadLogo = async (file: File) => {
    try {
      const encryption = crypto.randomUUID();

      await api.profile.uploadLogo(file, encryption);

      await saveProfileLogo.mutateAsync({ profile_logo: encryption });
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Upload failed.');
      showError(errorMessage);
      throw err;
    }
  };

  return {
    uploadLogo,
    isUploading: saveProfileLogo.isPending,
  };
}

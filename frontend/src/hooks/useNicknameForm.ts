import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { nicknameSchema } from '@/lib/validatorSchemas';
import { useUpdateProfile } from '@/routes/profile/-api/useUpdateProfile';

import { getErrorMessage } from '@/utils/errorUtils';

import { useRequiredAuth } from '../routes/auth/-hooks/useRequiredAuth';

type NicknameFormValues = { nickname: string };

const formSchema = z.object({ nickname: nicknameSchema });

interface UseNicknameFormProps {
  defaultNickname?: string;
  onSuccess?: (nickname: string) => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
}

export function useNicknameForm({
  defaultNickname = '',
  onSuccess,
  onError,
  resetOnSuccess = false,
}: UseNicknameFormProps) {
  const { user } = useRequiredAuth();
  const mutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setError: setFormError,
  } = useForm<NicknameFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nickname: defaultNickname },
    mode: 'onTouched',
  });

  const onSubmit = async ({ nickname }: NicknameFormValues) => {
    try {
      await mutation.mutateAsync({ nickname });
      if (resetOnSuccess) {
        reset({ nickname: '' });
      }
      onSuccess?.(nickname);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Error saving');
      setFormError('nickname', { message: errorMessage });
      onError?.(new Error(errorMessage));
    }
  };

  const nicknameValue = watch('nickname');
  const isPending = mutation.isPending || isSubmitting;
  const isDisabled = isPending || !nicknameValue || !user.id;

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isPending,
    isDisabled,
    isError: mutation.isError,
    error: mutation.error,
  };
}

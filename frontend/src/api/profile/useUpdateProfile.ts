import {
    type UpdateProfilePayload,
    updateProfileRequest,
} from "@/lib/updateProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateProfile = (userId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Omit<UpdateProfilePayload, "user_id">) => {
            if (!userId) throw new Error("Пользователь не найден");

            return await updateProfileRequest({
                user_id: userId,
                ...payload,
            });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        },
    });
};

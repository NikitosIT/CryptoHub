import { createSupabaseClient } from "./supabaseApi.ts";
import { errorResponse, unauthorizedResponse } from "./responses.ts";

export async function getAuthenticatedUser(req: Request) {
    const supabase = createSupabaseClient(req);
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
        throw unauthorizedResponse();
    }

    return { user, userId: user.id, supabase };
}

export async function requireAuth(req: Request) {
    return await getAuthenticatedUser(req);
}

export async function verifyUserId(
    req: Request,
    userIdFromBody: string | undefined,
): Promise<string> {
    const { userId } = await requireAuth(req);

    if (!userIdFromBody) {
        throw errorResponse("Missing user_id", 400);
    }

    if (userIdFromBody !== userId) {
        throw errorResponse(
            "Unauthorized: user_id does not match authenticated user",
            403,
        );
    }

    return userId;
}

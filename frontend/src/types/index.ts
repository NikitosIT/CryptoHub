import type { TelegramPost } from '@/routes/posts/-types/post-types';

export type PostId = TelegramPost['id'];
export type OTPCode = string;
export type Email = string;
export type NullableEmail = Email | null;
export type Error = string;

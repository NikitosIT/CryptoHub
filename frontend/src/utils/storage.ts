import { env } from '@/config/env';
import { USER_AVATARS_BUCKET, USER_LOGO_PREFIX } from '@/constants/storage';

const STORAGE_PUBLIC_PATH = '/storage/v1/object/public/';
const ABSOLUTE_URL_PREFIXES = ['blob:', 'http://', 'https://', '/'];

function getStorageOrigin() {
  return new URL(env.supabaseUrl).origin;
}

export function normalizeSupabaseStorageUrl(url: string | null | undefined): string {
  const value = url?.trim();
  if (!value) return '';

  if (!/^https?:\/\//i.test(value)) {
    return value;
  }

  try {
    const parsed = new URL(value);

    if (!parsed.pathname.startsWith(STORAGE_PUBLIC_PATH)) {
      return value;
    }

    return `${getStorageOrigin()}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return value;
  }
}

export function buildPublicStorageUrl(bucket: string, path: string): string {
  const normalizedPath = path.replace(/^\/+/, '');
  return `${getStorageOrigin()}${STORAGE_PUBLIC_PATH}${bucket}/${normalizedPath}`;
}

export function resolvePublicStorageUrl(
  pathOrUrl: string | null | undefined,
  bucket: string,
): string {
  const value = pathOrUrl?.trim();
  if (!value) return '';

  if (ABSOLUTE_URL_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return normalizeSupabaseStorageUrl(value);
  }

  return buildPublicStorageUrl(bucket, value);
}

export const getPublicAvatarUrl = (uuid: string) => {
  return normalizeSupabaseStorageUrl(
    buildPublicStorageUrl(USER_AVATARS_BUCKET, `${USER_LOGO_PREFIX}${uuid}.png`),
  );
};

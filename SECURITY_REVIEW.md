# Security Review & Recommendations

## 🔴 Critical Security Issues

### 1. **CORS Configuration - Wildcard Fallback**

**Location:** `supabase/functions/shared/cors.ts`

**Issue:** The CORS configuration falls back to `"*"` (allow all origins) when `ALLOWED_ORIGINS` is not set:

```typescript
if (!allowedOriginsEnv) {
  return requestOrigin || "*"; // ⚠️ Dangerous fallback
}
```

**Risk:** In production, if `ALLOWED_ORIGINS` is not configured, any website can make requests to your API, leading to CSRF attacks and data exposure.

**Recommendation:**

- Remove the wildcard fallback in production
- Always require `ALLOWED_ORIGINS` to be set
- Use environment-specific configurations

### 2. **Admin Authentication - No Rate Limiting**

**Location:** `supabase/functions/admin-auth/index.ts`

**Issue:** Admin login endpoint has no rate limiting, making it vulnerable to brute force attacks:

```typescript
if (body.password !== ADMIN_PASSWORD) {
  return errorResponse("Invalid password", 401);
}
```

**Risk:** Attackers can attempt unlimited password guesses.

**Recommendation:**

- Add rate limiting to admin login (e.g., 5 attempts per 15 minutes per IP)
- Implement account lockout after failed attempts
- Consider using more secure authentication (JWT with refresh tokens, 2FA)

### 3. **Sensitive Data in Console Logs**

**Location:** Multiple files

**Issues:**

- `supabase/functions/telegram-bot/index.ts:22` - Logs raw request data
- `supabase/functions/shared/rateLimiter.ts` - Multiple `console.error` statements
- Various `console.log` statements throughout

**Risk:** Sensitive information (tokens, user data, request payloads) may be logged and exposed.

**Recommendation:**

- Remove or sanitize all console.log statements in production
- Use structured logging that redacts sensitive fields
- Implement log levels (debug, info, error)

### 4. **Admin Password in Environment Variable**

**Location:** `supabase/functions/admin-auth/index.ts`

**Issue:** Simple password comparison stored in plain environment variable:

```typescript
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
if (body.password !== ADMIN_PASSWORD) {
  return errorResponse("Invalid password", 401);
}
```

**Risk:**

- If environment variables are leaked, admin access is compromised
- No password hashing or complexity requirements
- Single point of failure

**Recommendation:**

- Use password hashing (bcrypt/argon2)
- Implement proper admin user management in database
- Add password complexity requirements
- Consider OAuth or SSO for admin access

## 🟡 High Priority Issues

### 5. **File Upload Validation - MIME Type Spoofing**

**Location:** `frontend/src/api/index.ts:181-192`

**Issue:** File type validation relies on `file.type` which can be spoofed:

```typescript
const isImage = ALLOWED_IMAGE_TYPES.includes(
  file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
);
```

**Risk:** Malicious files can bypass validation by spoofing MIME types.

**Recommendation:**

- Validate file content (magic bytes/file signatures) on the server
- Don't trust client-provided MIME types
- Add server-side file type verification in edge functions

### 6. **HTML Sanitization - Potential XSS**

**Location:** `frontend/src/routes/posts/-utils/sanitizeHtml.ts`

**Issue:** While DOMPurify is used, the configuration allows `<a>` tags which could be risky:

```typescript
ADD_TAGS: ["a"],
ADD_ATTR: ["href", "target", "rel"],
```

**Risk:** If DOMPurify configuration is too permissive, XSS attacks are possible.

**Recommendation:**

- Review DOMPurify configuration for strictness
- Test with XSS payloads
- Consider Content Security Policy (CSP) headers
- Validate URLs in `href` attributes more strictly

### 7. **Error Message Information Disclosure**

**Location:** Multiple edge functions

**Issue:** Some error messages may reveal internal structure:

- File paths in error messages
- Database structure hints
- Stack traces in production

**Recommendation:**

- Use generic error messages for users
- Log detailed errors server-side only
- Implement error sanitization middleware

### 8. **Rate Limiting - Inconsistent Application**

**Location:** Various edge functions

**Issue:** Rate limiting is applied to comment creation but may be missing from other endpoints:

- Admin login (already mentioned)
- Profile updates
- Token forecast generation
- Other mutation endpoints

**Recommendation:**

- Apply rate limiting to all mutation endpoints
- Use consistent rate limiting configuration
- Consider IP-based rate limiting for public endpoints

## 🟢 Medium Priority Issues

### 9. **Session Token Storage - Client-Side**

**Location:** `admin/src/utils/adminStorage.ts` (implied)

**Issue:** Admin session tokens stored in client-side storage (localStorage/sessionStorage).

**Risk:** Vulnerable to XSS attacks that could steal tokens.

**Recommendation:**

- Use httpOnly cookies for session tokens
- Implement CSRF tokens
- Add token rotation on sensitive operations

### 10. **File Size Limits - Client-Side Only**

**Location:** `frontend/src/api/index.ts:177`

**Issue:** File size validation happens client-side:

```typescript
if (file.size > MAX_FILE_SIZE) {
  throw new Error(`File "${file.name}" exceeds maximum size of 5MB`);
}
```

**Risk:** Client-side validation can be bypassed.

**Recommendation:**

- Enforce file size limits on the server
- Add storage bucket policies for max file size
- Validate in edge functions before upload

### 11. **Media URL Validation - Incomplete**

**Location:** `supabase/functions/user-comments/actions/createComment.ts:66-85`

**Issue:** Media URL validation allows filenames without full validation:

```typescript
const isFilename =
  !mediaItem.url.includes("/") && !mediaItem.url.startsWith("http");
```

**Risk:** Path traversal attacks possible if filenames aren't properly sanitized.

**Recommendation:**

- Validate filename format strictly (UUID pattern)
- Prevent path traversal (`../`, `..\\`)
- Whitelist allowed characters in filenames

### 12. **Password Requirements - Weak**

**Location:** `supabase/config.toml:142`

**Issue:** Minimum password length is only 6 characters:

```toml
minimum_password_length = 6
password_requirements = ""
```

**Risk:** Weak passwords are vulnerable to brute force attacks.

**Recommendation:**

- Increase minimum password length to 12+ characters
- Enforce password complexity requirements
- Implement password strength meter
- Consider password history to prevent reuse

## 🔵 Low Priority / Improvements

### 13. **Input Validation - Comment Length Mismatch**

**Location:**

- Frontend: `frontend/src/lib/validatorSchemas.ts:35` - max 500 chars
- Backend: `supabase/functions/user-comments/actions/createComment.ts:31` - max 1000 chars

**Issue:** Inconsistent validation limits between frontend and backend.

**Recommendation:**

- Align validation limits
- Backend should always be the source of truth
- Frontend validation is for UX only

### 14. **Missing Security Headers**

**Recommendation:**

- Add Content Security Policy (CSP)
- Add X-Frame-Options
- Add X-Content-Type-Options
- Add Strict-Transport-Security (HSTS)
- Add Referrer-Policy

### 15. **Database Query - Potential N+1**

**Location:** Various edge functions

**Issue:** Some queries may be inefficient (N+1 problem).

**Recommendation:**

- Review query patterns
- Use batch queries where possible
- Add database indexes for frequently queried fields

### 16. **Environment Variable Validation**

**Issue:** Missing validation for required environment variables at startup.

**Recommendation:**

- Add startup validation for all required env vars
- Fail fast with clear error messages
- Document required environment variables

### 17. **Telegram Bot - No Input Validation**

**Location:** `supabase/functions/telegram-bot/index.ts`

**Issue:** Telegram webhook accepts any input without validation.

**Recommendation:**

- Validate Telegram webhook signatures
- Verify request source
- Add rate limiting

### 18. **2FA Implementation - Review Needed**

**Location:** `supabase/functions/verify-2fa-setup/index.ts`

**Issue:** Need to verify:

- Secret storage security
- Token validation window
- Rate limiting on verification attempts

**Recommendation:**

- Review 2FA implementation thoroughly
- Ensure secrets are encrypted at rest
- Implement proper rate limiting

## ✅ Good Security Practices Found

1. ✅ **User ID Verification** - Properly implemented in `verifyUserId()`
2. ✅ **Input Sanitization** - Text sanitization functions exist
3. ✅ **Rate Limiting** - Implemented for comments
4. ✅ **Authentication Checks** - Proper auth verification in edge functions
5. ✅ **File Type Validation** - MIME type checking (though needs improvement)
6. ✅ **Authorization Checks** - Users can only modify their own comments
7. ✅ **SQL Injection Protection** - Using Supabase client (parameterized queries)
8. ✅ **CORS Headers** - CORS is implemented (needs production hardening)
9. ✅ **Error Handling** - Structured error handling in place
10. ✅ **Media Cleanup** - Old media files are deleted on comment update/delete

## 📋 Action Items Priority

### Immediate (Critical)

1. Fix CORS wildcard fallback
2. Add rate limiting to admin login
3. Remove/sanitize console.log statements
4. Implement server-side file type validation

### Short-term (High Priority)

5. Strengthen admin authentication
6. Review and harden HTML sanitization
7. Add server-side file size validation
8. Implement security headers

### Medium-term (Medium Priority)

9. Fix media URL validation
10. Strengthen password requirements
11. Align validation limits
12. Add environment variable validation

### Long-term (Low Priority)

13. Implement comprehensive logging
14. Add security monitoring/alerting
15. Conduct penetration testing
16. Set up automated security scanning

## 🔒 Additional Recommendations

1. **Regular Security Audits** - Schedule quarterly security reviews
2. **Dependency Updates** - Keep all dependencies up to date
3. **Security Testing** - Add automated security tests to CI/CD
4. **Monitoring** - Implement security event monitoring
5. **Incident Response** - Create incident response plan
6. **Documentation** - Document security architecture and decisions
7. **Training** - Ensure team understands security best practices

---

**Review Date:** 2024
**Reviewed By:** AI Security Analysis
**Next Review:** Recommended in 3 months or after major changes

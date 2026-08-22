import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { createRouteGuard } from '@/hooks/routeGuards';
import { codeSchema } from '@/lib/validatorSchemas';
import { useVerifyOTP } from '@/routes/auth/-hooks/useVerifyOTP';

import { useCodeForm } from './-hooks/useCodeForm';

const verifySearchSchema = z.object({
  redirectTo: z.string().optional(),
  mode: z.literal('email').optional(),
  email: z.email().optional(),
});

export const Route = createFileRoute('/auth/verify')({
  validateSearch: verifySearchSchema,
  beforeLoad: createRouteGuard({
    requireNoAuth: false,
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { register, codeFormErrors, handleSubmit } = useCodeForm({
    schema: codeSchema,
  });
  const { showOTPField, isOtpSubmitting, onSubmit, isAuthLoading } = useVerifyOTP();

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-black">
      <div className="w-full max-w-md p-8 bg-gray-900 border border-orange-500/20 rounded-xl">
        <h2 className="mb-6 text-3xl font-semibold text-center text-white">
          🔐 Подтверждение
        </h2>

        {isAuthLoading || !showOTPField ? (
          <div className="text-center text-white">
            <p className="text-sm">Verifying authentication...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label
                htmlFor="code"
                className="block mb-2 text-sm font-medium text-gray-300"
              >
                Код подтверждения
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={isOtpSubmitting}
                maxLength={6}
                className="w-full p-3 text-2xl tracking-widest text-center text-white border rounded bg-white/5 border-orange-500/30 focus:outline-none focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                {...register('code', {
                  setValueAs: (v: string) => v.replace(/\D/g, '').slice(0, 6),
                })}
              />
              {codeFormErrors.code && (
                <p className="mt-1 text-sm text-red-400">{codeFormErrors.code.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isOtpSubmitting}
              className="flex items-center justify-center w-full py-3 font-medium text-white transition-colors duration-200 bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOtpSubmitting ? (
                <span className="inline-block w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
              ) : (
                'Подтвердить'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

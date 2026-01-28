import { createFileRoute } from "@tanstack/react-router";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { createRouteGuard } from "@/hooks/routeGuards";
import { useVerifyOTP } from "@/routes/auth/-hooks/useVerifyOTP";

const verifySearchSchema = z.object({
  redirectTo: z.string().optional(),
  mode: z.literal("email").optional(),
  email: z.string().email().optional(),
});

export const Route = createFileRoute("/auth/verify")({
  validateSearch: verifySearchSchema,
  beforeLoad: createRouteGuard({
    requireNoAuth: false,
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const {
    showOTPField,
    control,
    otpFormErrors,
    isOtpSubmitting,
    handleOtpSubmit,
    isAuthLoading,
  } = useVerifyOTP();

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
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-4">
              <label
                htmlFor="code"
                className="block mb-2 text-sm font-medium text-gray-300"
              >
                Код подтверждения
              </label>
              <Controller
                control={control}
                name="code"
                render={({ field }) => (
                  <input
                    id="code"
                    type="text"
                    placeholder="Введите 6-значный код"
                    value={field.value}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      field.onChange(value);
                    }}
                    disabled={isOtpSubmitting}
                    maxLength={6}
                    className="w-full p-3 text-2xl tracking-widest text-center text-white border rounded bg-white/5 border-orange-500/30 focus:outline-none focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                )}
              />
              {otpFormErrors.code && (
                <p className="mt-1 text-sm text-red-400">
                  {otpFormErrors.code.message}
                </p>
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
                "Подтвердить"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

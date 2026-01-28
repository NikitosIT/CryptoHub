import { createFileRoute } from "@tanstack/react-router";

import { createRouteGuard } from "@/hooks/routeGuards";
import { useLogin } from "@/routes/auth/-hooks/useLogin";

export const Route = createFileRoute("/auth/")({
  beforeLoad: createRouteGuard({
    requireNoAuth: true,
    redirectTo: "/",
  }),
  component: AuthPage,
});

function AuthPage() {
  const { register, handleSubmit, formErrors, isPending } = useLogin();

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-black">
      <div className="w-full max-w-md p-8 bg-gray-900 border border-orange-500/20 rounded-xl">
        <h2 className="mb-6 text-3xl font-semibold text-center text-white">
          🔐 Вход в админку
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Введите email"
              {...register("email")}
              disabled={isPending}
              className="w-full p-3 text-white border rounded bg-white/5 border-orange-500/30 focus:outline-none focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-400">
                {formErrors.email.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center w-full py-3 font-medium text-white transition-colors duration-200 bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="inline-block w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
            ) : (
              "Продолжить"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;

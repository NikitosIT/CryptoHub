import { supabase } from "@/lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function AuthGoogle() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-[#111]/90 border border-[#333] rounded-2xl shadow-xl p-8 w-[380px] text-center">
        <h1 className="mb-6 text-2xl font-semibold text-white">
          Войти через Google
        </h1>

        <Auth
          supabaseClient={supabase}
          onlyThirdPartyProviders
          providers={["google"]}
          redirectTo={`${window.location.origin}/auth/callback`}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#16a34a",
                  brandAccent: "#9333ea",
                },
              },
            },
            className: {
              button:
                "bg-gradient-to-r from-green-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg",
            },
          }}
        />
      </div>
    </div>
  );
}

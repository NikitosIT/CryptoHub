import { Box, Typography } from "@mui/material";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { supabase } from "@/lib/supabaseClient";

export default function AuthGoogle() {
  return (
    <Box
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: { xs: 2, sm: 3 },
        width: { xs: "100%", md: 400 },
        bgcolor: "rgba(30, 30, 30, 0.8)",
        color: "white",
      }}
    >
      <Typography
        variant="h5"
        fontWeight={600}
        textAlign="center"
        sx={{
          mb: { xs: 3, sm: 4 },
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        Enter with Google
      </Typography>

      <Box display="flex" justifyContent="center">
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
                  brand: "#1976d2",
                  brandAccent: "#1565c0",
                },
              },
            },
            className: {
              button:
                "w-full text-white font-semibold rounded-lg transition-all duration-200",
            },
          }}
        />
      </Box>
    </Box>
  );
}

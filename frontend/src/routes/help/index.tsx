import EmailIcon from "@mui/icons-material/Email";
import {
  Box,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

import { AuthButton } from "@/components/ui/AuthButton";

export const Route = createFileRoute("/help/")({
  component: CryptoHelper,
});

function CryptoHelper() {
  return (
    <Container
      maxWidth="md"
      sx={{
        mt: { xs: 4, sm: 6, md: 8 },
        mb: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Typography
        variant="h4"
        fontWeight={600}
        textAlign="center"
        sx={{
          color: "white",
          fontSize: { xs: "24px", sm: "28px", md: "32px" },
          mb: { xs: 3, sm: 4, md: 5 },
        }}
      >
        Help Center
      </Typography>

      <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
        {/* First Block: Input Field and Button */}
        <Paper
          sx={{
            p: { xs: 3, sm: 3.5, md: 4 },
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            bgcolor: "rgba(30, 30, 30, 0.8)",
            color: "white",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              color: "white",
              fontSize: { xs: "18px", sm: "20px" },
              mb: { xs: 2, sm: 2.5 },
            }}
          >
            Contact Support
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: { xs: "12px", sm: "14px" },
              mb: { xs: 2, sm: 2.5 },
            }}
          >
            Have a question or need assistance? Send us a message and we&apos;ll
            get back to you as soon as possible.
          </Typography>

          <Box
            component="form"
            display="flex"
            flexDirection="column"
            gap={{ xs: 2, sm: 2.5 }}
          >
            <TextField
              label="Your message"
              multiline
              rows={4}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.6)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "rgba(255, 255, 255, 0.9)",
                },
                "& .MuiOutlinedInput-input": {
                  color: "white",
                },
                "& .MuiFormHelperText-root": {
                  color: "rgba(255, 255, 255, 0.6)",
                },
              }}
            />

            <AuthButton type="submit" fullWidth>
              Send Message
            </AuthButton>
          </Box>
        </Paper>

        {/* Second Block: Gmail Link */}
        <Paper
          sx={{
            p: { xs: 3, sm: 3.5, md: 4 },
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            bgcolor: "rgba(30, 30, 30, 0.8)",
            color: "white",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              color: "white",
              fontSize: { xs: "18px", sm: "20px" },
              mb: { xs: 2, sm: 2.5 },
            }}
          >
            Email Us Directly
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: { xs: "12px", sm: "14px" },
              mb: { xs: 2, sm: 2.5 },
            }}
          >
            Prefer to send an email? Click the link below to open Gmail and send
            us a message.
          </Typography>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: { xs: 2, sm: 2.5 } }}
          >
            <Link
              href="https://mail.google.com/mail/?view=cm&fs=1&to=cryptohub.helper@gmail.com&su=Support%20Request"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                color: "#fb923c",
                textDecoration: "none",
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 500,
                transition: "color 0.2s ease",
                "&:hover": {
                  color: "#f97316",
                  textDecoration: "underline",
                },
              }}
            >
              <EmailIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              <span>Send email to cryptohub.helper@gmail.com</span>
            </Link>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}

export default CryptoHelper;

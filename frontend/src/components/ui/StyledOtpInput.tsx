import OtpInput from "react-otp-input";
import { Box, useMediaQuery, useTheme } from "@mui/material";

interface StyledOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  shouldAutoFocus?: boolean;
  disabled?: boolean;
}

export function StyledOtpInput({
  value,
  onChange,
  shouldAutoFocus = true,
  disabled = false,
}: StyledOtpInputProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const cellWidth = isMobile ? "36px" : isTablet ? "42px" : "48px";
  const cellHeight = isMobile ? "44px" : isTablet ? "50px" : "56px";
  const fontSize = isMobile ? "18px" : isTablet ? "21px" : "24px";
  const margin = isMobile ? "0 4px" : isTablet ? "0 5px" : "0 6px";
  const borderRadius = isMobile ? "6px" : "8px";

  return (
    <Box
      sx={{
        "& input": {
          borderColor: "rgba(255, 255, 255, 0.23)",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          transition: "all 0.2s",
          outline: "none",
        },
        "& input:focus": {
          borderColor: "#fb923c",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
        "& input:disabled": {
          opacity: 0.6,
          cursor: "not-allowed",
        },
      }}
    >
      <OtpInput
        value={value}
        onChange={onChange}
        numInputs={6}
        renderInput={(props) => (
          <input
            {...props}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={disabled}
            style={{
              width: cellWidth,
              height: cellHeight,
              fontSize,
              fontWeight: 600,
              textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.23)",
              borderRadius,
              margin,
              cursor: disabled ? "not-allowed" : "text",
              color: "white",
            }}
          />
        )}
        shouldAutoFocus={Boolean(shouldAutoFocus && !disabled)}
        inputType="text"
      />
    </Box>
  );
}

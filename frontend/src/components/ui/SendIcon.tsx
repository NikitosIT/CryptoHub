import { Box, type BoxProps } from "@mui/material";

export interface SendIconProps
  extends Omit<BoxProps, "component" | "src" | "alt"> {
  size?: "small" | "medium" | "large";
}

const sizeMap = {
  small: { xs: "16px", sm: "18px" },
  medium: { xs: "18px", sm: "20px" },
  large: { xs: "20px", sm: "24px" },
};

export function SendIcon({ size = "medium", sx, ...props }: SendIconProps) {
  return (
    <Box
      component="img"
      src="/others/sendMessage.svg"
      alt="Send"
      sx={{
        width: sizeMap[size],
        height: sizeMap[size],
        filter: "brightness(0) invert(1)",
        ...sx,
      }}
      {...props}
    />
  );
}

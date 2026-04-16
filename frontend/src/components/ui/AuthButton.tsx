import { Button, type ButtonProps } from '@mui/material';

type AuthButtonProps = {
  isLoading?: boolean;
  loadingText?: string;
} & ButtonProps;

export function AuthButton({
  isLoading = false,
  loadingText,
  children,
  disabled,
  size = 'large',
  sx,
  ...props
}: AuthButtonProps) {
  return (
    <Button
      variant="contained"
      size={size}
      disabled={isLoading || disabled}
      sx={{
        backgroundColor: '#fb923c',
        color: '#fff',
        '&:hover': {
          backgroundColor: '#f97316',
        },
        '&.Mui-disabled': {
          backgroundColor: 'rgba(251, 146, 60, 0.5)',
          color: 'rgba(255, 255, 255, 0.7)',
        },
        ...sx,
      }}
      {...props}
    >
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}

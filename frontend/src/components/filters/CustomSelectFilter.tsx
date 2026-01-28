/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type React from "react";
import {
  Autocomplete,
  Box,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export interface SelectFilterProps<T> {
  label: string;
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  getOptionLabel?: (opt: T) => string;
  isOptionEqual?: (a: T, b: T) => boolean;
  showLogos?: boolean;
}

type OptionType = {
  label: string;
  id?: number;
  value?: string;
};

// Helper component for token images
function TokenImage({ label }: { label: string }) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src.includes(".svg")) {
      img.src = `/tokens/${label}.png`;
    }
  };

  return (
    <Box
      component="img"
      src={`/tokens/${label}.svg`}
      alt={label}
      onError={handleError}
      sx={{
        width: 20,
        height: 20,
        objectFit: "contain",
        borderRadius: 0.5,
        bgcolor: "#121212",
        flexShrink: 0,
      }}
    />
  );
}

// Helper component for author images
function AuthorImage({ id, label }: { id: number; label: string }) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src.includes(".jpg")) {
      img.src = `/authors/${id}.png`;
    }
  };

  return (
    <Box
      component="img"
      src={`/authors/${id}.jpg`}
      alt={label}
      onError={handleError}
      sx={{
        width: 24,
        height: 24,
        objectFit: "cover",
        borderRadius: "50%",
        flexShrink: 0,
      }}
    />
  );
}

export default function SelectFilter<T extends OptionType>({
  label,
  options,
  value,
  onChange,
  getOptionLabel,
  isOptionEqual,
  showLogos,
}: SelectFilterProps<T>) {
  const isAuthorFilter = !showLogos;

  return (
    <Autocomplete
      disablePortal
      options={options}
      value={value}
      onChange={(_, val) => onChange(val ?? null)}
      getOptionLabel={getOptionLabel ?? ((opt) => opt.label)}
      isOptionEqualToValue={
        isOptionEqual ?? ((a, b) => a.value === b.value || a.id === b.id)
      }
      PaperComponent={(props) => (
        <Paper
          {...props}
          sx={{
            bgcolor: "#121212",
            borderRadius: 1.5,
            mt: 0.5,
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...rest } = props;

        return (
          <Box
            component="li"
            key={key}
            {...rest}
            sx={{
              px: 1,
              py: 0.75,
              cursor: "pointer",
              "&:hover": {
                bgcolor: "#1e1e1e",
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              {showLogos === true && <TokenImage label={option.label} />}
              {isAuthorFilter === true && option.id !== undefined && (
                <AuthorImage id={option.id} label={option.label} />
              )}
              <Typography
                variant="body2"
                color="white"
                noWrap
                sx={{ maxWidth: 180 }}
              >
                {option.label}
              </Typography>
            </Stack>
          </Box>
        );
      }}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            label={label}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  {value !== null && showLogos === true && (
                    <InputAdornment position="start">
                      <TokenImage label={value.label} />
                    </InputAdornment>
                  )}
                  {value !== null &&
                    isAuthorFilter === true &&
                    value.id !== undefined && (
                      <InputAdornment position="start">
                        <AuthorImage id={value.id} label={value.label} />
                      </InputAdornment>
                    )}
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        );
      }}
      sx={{
        width: "100%",
        maxWidth: 320,
        "& .MuiInputBase-root": {
          bgcolor: "#111",
          color: "#fff",
          borderRadius: 1.5,
          minHeight: 48,
        },
        "& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator":
          {
            color: "#e0e0e0",
            "&:hover": {
              color: "#ffffff",
              bgcolor: "transparent",
            },
          },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#444",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#666",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#888",
        },
        "& .MuiInputLabel-root": {
          color: "#aaa",
          "&.Mui-focused": { color: "#ccc" },
        },
        "& .MuiAutocomplete-listbox": {
          maxHeight: 280,
          bgcolor: "#121212",
          padding: 0,
          "&::-webkit-scrollbar": {
            width: 8,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#2a2a2a",
            borderRadius: 8,
            "&:hover": {
              backgroundColor: "#3a3a3a",
            },
          },
        },
      }}
    />
  );
}

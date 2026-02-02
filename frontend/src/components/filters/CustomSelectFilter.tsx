import type React from "react";
import { useCallback, useMemo } from "react";
import {
  Autocomplete,
  Box,
  InputAdornment,
  Paper,
  type PaperProps,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";

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

function defaultGetOptionLabel(opt: OptionType) {
  return opt.label;
}
function defaultIsOptionEqual(a: OptionType, b: OptionType) {
  return a.value === b.value || a.id === b.id;
}

const dropdownPaperSx = {
  bgcolor: "#121212",
  borderRadius: 1.5,
  mt: 0.5,
};

function DropdownPaper(props: PaperProps) {
  return <Paper {...props} sx={dropdownPaperSx} />;
}

function TokenImage({ label }: { label: string }) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    return (img.src = `/tokens/${label}.png`);
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

function AuthorImage({ id, label }: { id: number; label: string }) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    return (img.src = `/authors/${id}.png`);
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

  const handleChange = useCallback(
    (_: unknown, val: T | null) => onChange(val ?? null),
    [onChange],
  );

  const optionLabel = getOptionLabel ?? defaultGetOptionLabel;
  const optionEqual = isOptionEqual ?? defaultIsOptionEqual;

  const renderOption = useCallback(
    (
      props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
      option: T,
    ) => {
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
            "&:hover": { bgcolor: "#1e1e1e" },
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
    },
    [showLogos, isAuthorFilter],
  );

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
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
    ),
    [label, value, showLogos, isAuthorFilter],
  );

  const autocompleteSx = useMemo(
    () => ({
      width: "100%",
      maxWidth: 320,
      "& .MuiInputBase-root": {
        bgcolor: "#111",
        color: "#fff",
        borderRadius: 1.5,
        minHeight: 48,
      },
      "& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator": {
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
        "&::-webkit-scrollbar": { width: 8 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#2a2a2a",
          borderRadius: 8,
          "&:hover": { backgroundColor: "#3a3a3a" },
        },
      },
    }),
    [],
  );

  return (
    <Autocomplete
      disablePortal
      options={options}
      value={value}
      onChange={handleChange}
      getOptionLabel={optionLabel}
      isOptionEqualToValue={optionEqual}
      PaperComponent={DropdownPaper}
      renderOption={renderOption}
      renderInput={renderInput}
      sx={autocompleteSx}
    />
  );
}

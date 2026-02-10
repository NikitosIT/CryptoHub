import type React from "react";
import { memo, useCallback, useMemo } from "react";
import {
  Autocomplete,
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";

import { AuthorImg, DropdownPaper, TokenImg } from "./FilterImages";

interface SelectFilterProps<T> {
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

function SelectFilter<T extends OptionType>({
  label,
  options,
  value,
  onChange,
  showLogos,
}: SelectFilterProps<T>) {
  const renderOption = useCallback(
    (
      props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
      option: T,
    ) => {
      const { key, ...rest } = props;
      return (
        <Box component="li" key={key} {...rest} sx={optionSx}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {showLogos ? <TokenImg label={option.label} /> : null}
            {!showLogos && option.id !== undefined && (
              <AuthorImg id={option.id} label={option.label} />
            )}
            <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
              {option.label}
            </Typography>
          </Stack>
        </Box>
      );
    },
    [showLogos],
  );

  const startAdornment = useMemo(() => {
    if (!value) return null;

    if (showLogos) {
      return <TokenImg label={value.label} />;
    }

    if (value.id != null) {
      return <AuthorImg id={value.id} label={value.label} />;
    }

    return null;
  }, [value, showLogos]);

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
      <TextField
        {...params}
        label={label}
        slotProps={{
          input: {
            ...params.InputProps,
            startAdornment: (
              <>
                {startAdornment ? (
                  <InputAdornment position="start">
                    {startAdornment}
                  </InputAdornment>
                ) : null}
                {params.InputProps.startAdornment}
              </>
            ),
          },
        }}
      />
    ),
    [label, startAdornment],
  );

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_: unknown, val: T | null) => onChange(val)}
      slots={{ paper: DropdownPaper }}
      renderOption={renderOption}
      renderInput={renderInput}
      sx={autocompleteSx}
    />
  );
}

export default memo(SelectFilter) as typeof SelectFilter;

const autocompleteSx = {
  width: "100%",
  maxWidth: 320,
  "& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator": {
    color: "#e0e0e0",
    "&:hover": {
      color: "#ffffff",
    },
  },
  "& .MuiAutocomplete-input": {
    "@media (max-width: 840px)": {
      maxWidth: "calc(100% - 60px)",
    },
  },
};

const optionSx = {
  px: 1,
  py: 0.75,
  cursor: "pointer",
  "&:hover": { bgcolor: "#1e1e1e" },
};

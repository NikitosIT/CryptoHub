import type React from 'react';
import { Children, forwardRef, memo } from 'react';
import { List, type RowComponentProps } from 'react-window';
import {
  Autocomplete,
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';

import { DropdownPaper, OptionImage } from './FilterImages';

const ROW_HEIGHT = 42;
const MAX_VISIBLE_ROWS = 8;

interface VirtualRowData {
  items: React.ReactNode[];
}

function VirtualRow({ index, style, items }: RowComponentProps<VirtualRowData>) {
  return <div style={style}>{items[index]}</div>;
}

const VirtualizedListbox = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
  function VirtualizedListbox(props, ref) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, ownerState, ...other } =
      props as React.HTMLAttributes<HTMLElement> & {
        ownerState?: unknown;
      };
    const items = Children.toArray(children);
    const height = Math.min(items.length, MAX_VISIBLE_ROWS) * ROW_HEIGHT;

    return (
      <div ref={ref} {...other}>
        <List<VirtualRowData>
          rowCount={items.length}
          rowHeight={ROW_HEIGHT}
          rowProps={{ items }}
          rowComponent={VirtualRow}
          style={{ height }}
          overscanCount={5}
        />
      </div>
    );
  },
);

interface SelectFilterProps<T> {
  label: string;
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  getOptionLabel?: (opt: T) => string;
  isOptionEqual?: (a: T, b: T) => boolean;
}

export type OptionType = {
  label: string;
  id?: number;
  value?: string;
  imageUrl?: string;
};

function SelectFilter<T extends OptionType>({
  label,
  options,
  value,
  onChange,
}: SelectFilterProps<T>) {
  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
    option: T,
  ) => {
    const { key, ...rest } = props;
    return (
      <Box component="li" key={key} {...rest} sx={optionSx}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <OptionImage option={option} />
          <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
            {option.label}
          </Typography>
        </Stack>
      </Box>
    );
  };

  const startAdornment = value ? <OptionImage option={value} /> : null;

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...params}
      label={label}
      slotProps={{
        input: {
          ...params.InputProps,
          startAdornment: (
            <>
              {startAdornment ? (
                <InputAdornment position="start">{startAdornment}</InputAdornment>
              ) : null}
              {params.InputProps.startAdornment}
            </>
          ),
        },
      }}
    />
  );
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_: unknown, val: T | null) => onChange(val)}
      slots={{
        paper: DropdownPaper,
        listbox: VirtualizedListbox,
      }}
      renderOption={renderOption}
      renderInput={renderInput}
      sx={autocompleteSx}
    />
  );
}

export default memo(SelectFilter) as typeof SelectFilter;

const autocompleteSx = {
  width: '100%',
  maxWidth: 320,
  '& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator': {
    color: '#e0e0e0',
    '&:hover': {
      color: '#ffffff',
    },
  },
  '& .MuiAutocomplete-input': {
    '@media (max-width: 840px)': {
      maxWidth: 'calc(100% - 60px)',
    },
  },
};

const optionSx = {
  px: 1,
  py: 0.75,
  cursor: 'pointer',
  '&:hover': { bgcolor: '#1e1e1e' },
};

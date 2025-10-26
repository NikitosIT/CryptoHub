import type { SelectFilterProps } from "@/types/selectFilterType";
import { Autocomplete, TextField } from "@mui/material";

export default function SelectFilter<
  T extends {
    label: string;
    id?: number;
    value?: string;
    showLogos?: boolean;
  },
>({
  label,
  options,
  value,
  onChange,
  getOptionLabel,
  isOptionEqual,
  loading,
  error,
  showLogos,
}: SelectFilterProps<T>) {
  if (loading) return <p className="text-gray-400">Загрузка...</p>;
  if (error) return <p className="text-red-500">Ошибка: {error}</p>;

  return (
    <Autocomplete
      disablePortal
      options={options}
      value={value}
      getOptionLabel={getOptionLabel || ((opt) => opt.label || "")}
      onChange={(_, val) => onChange(val ?? null)}
      isOptionEqualToValue={
        isOptionEqual ||
        ((opt, val) => opt.value === val.value || opt.id === val.id)
      }
      renderOption={(props, option) => {
        const { key, ...other } = props;
        const isAuthorFilter = !showLogos;
        const tokenSrc = `/tokens/${option.label}.svg`;
        const authorBase = `/authors/${option.id}`;

        return (
          <li
            key={key}
            {...other}
            className="flex items-center gap-3 px-3 py-2 bg-[#121212] hover:bg-[#1e1e1e] 
             transition-all duration-200 cursor-pointer rounded-md"
          >
            {/* === Токены === */}
            {showLogos && option.label && (
              <img
                src={tokenSrc}
                onError={(e) =>
                  (e.currentTarget.src = `/tokens/${option.label}.png`)
                }
                alt={option.label}
                className="object-contain w-5 h-5 "
              />
            )}

            {/* === Авторы === */}

            {isAuthorFilter && (
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-[#121212]">
                <img
                  src={`${authorBase}.jpg`}
                  alt={option.label}
                  className="object-cover w-full h-full rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = `${authorBase}.png`;
                  }}
                />
              </div>
            )}

            {/* === Имя === */}
            <span className="text-sm font-medium text-white truncate transition-colors duration-200 hover:text-blue-400">
              {option.label}
            </span>
          </li>
        );
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
      sx={{
        width: "100%",
        maxWidth: 320,
        minWidth: 220,
        "& .MuiInputBase-root": {
          backgroundColor: "#111",
          color: "#fff",
          borderRadius: "8px",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#444",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#777",
        },
        "& .MuiSvgIcon-root": { color: "#fff" },
        "& .MuiInputLabel-root": { color: "#aaa" },
        "& .MuiAutocomplete-listbox": {
          backgroundColor: "#121212",
          paddingTop: 0,
        },
      }}
    />
  );
}

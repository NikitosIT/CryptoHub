export interface SelectFilterProps<T> {
    label: string;
    options: T[];
    value: T | null;
    onChange: (value: T | null) => void;
    getOptionLabel?: (opt: T) => string;
    isOptionEqual?: (a: T, b: T) => boolean;
    loading?: boolean;
    error?: string | null;
    showLogos?: boolean;
}

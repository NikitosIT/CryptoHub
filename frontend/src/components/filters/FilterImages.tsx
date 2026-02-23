import { Paper, type PaperProps } from '@mui/material';
import type { OptionType } from './CustomSelectFilter';

export function AuthorImg({ id, label }: { id: number; label: string }) {
  return (
    <img
      className="object-cover w-6 h-6 rounded-full shrink-0"
      src={`/authors/${id}.jpg`}
      alt={label}
      onError={(e) => {
        const img = e.currentTarget;
        return (img.src = `/authors/${id}.png`);
      }}
    />
  );
}

export function DropdownPaper(props: PaperProps) {
  return (
    <Paper
      {...props}
      sx={{
        bgcolor: '#121212',
        borderRadius: 1.5,
        mt: 0.5,
      }}
    />
  );
}

export function OptionImage({ option }: { option: OptionType }) {
  if (option.imageUrl) {
    return (
      <img
        className="object-contain w-5 h-5 bg-black rounded-full shrink-0"
        src={option.imageUrl}
        alt={option.label}
      />
    );
  }
  if (option.id !== undefined) {
    return <AuthorImg id={option.id} label={option.label} />;
  }
  return null;
}

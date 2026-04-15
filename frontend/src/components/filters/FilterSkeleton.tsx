import { Box, Skeleton } from '@mui/material';

export default function FilterSkeleton() {
  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{
          width: '100%',
          maxWidth: 320,
          borderRadius: 1,
          bgcolor: 'rgba(38, 38, 38, 0.8)',
        }}
      />
    </Box>
  );
}

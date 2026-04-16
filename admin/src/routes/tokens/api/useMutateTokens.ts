import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { api } from '@/api';

import { useListCryptoTokens } from './useListCryptoTokens';

export function useMutateTokens() {
  const { data } = useListCryptoTokens();
  const [addedTokens, setAddedTokens] = useState<Set<string>>(new Set());

  const insertAll = useMutation({
    mutationFn: async (names: string[]) => api.tokens.insertAll(names),
    onSuccess() {
      if (data) {
        setAddedTokens(new Set(data.map((t) => t.name)));
      }
    },
  });

  const insertOne = useMutation({
    mutationFn: async (name: string) => api.tokens.insertOne(name),
    onSuccess(_, name) {
      setAddedTokens((prev) => new Set(prev).add(name));
    },
  });

  const handleAddAll = () => {
    if (!data?.length || insertAll.isPending) return;
    insertAll.mutate(data.map((t) => t.name));
  };

  const handleAddOne = (name: string) => {
    if (insertOne.isPending) return;
    insertOne.mutate(name);
  };

  return {
    addedTokens,
    insertAll,
    insertOne,
    handleAddAll,
    handleAddOne,
  };
}

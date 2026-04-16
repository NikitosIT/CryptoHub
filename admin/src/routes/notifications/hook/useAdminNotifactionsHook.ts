import { useState } from 'react';

import { useSendNotification } from '@/api';

export const useAdminNotifactionsHook = () => {
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const { mutateAsync: sendNotification, isPending } = useSendNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = message.trim();
    if (!msg) return;
    if (!sendToAll && !selectedUser) return;

    try {
      await sendNotification({
        send_to: selectedUser ?? '',
        send_to_all: sendToAll,
        msg,
      });
      setMessage('');
      setSelectedUser(null);
    } catch {
      // ignore
    }
  };

  const canSubmit =
    message.trim().length > 0 && !isPending && (sendToAll || Boolean(selectedUser));

  return {
    sendToAll,
    setSendToAll,
    isPending,
    handleSubmit,
    canSubmit,
    selectedUser,
    setSelectedUser,
    message,
    setMessage,
  };
};

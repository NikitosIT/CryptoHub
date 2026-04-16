import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { createRouteGuard } from '@/hooks/routeGuards';
import { getPublicAvatarUrl } from '@/utils/storage';

import { useProfilesList } from './api/useUserInfo';
import { useAdminNotifactionsHook } from './hook/useAdminNotifactionsHook';
import { filterProfiles } from './utils/filterProfiles';

export const Route = createFileRoute('/notifications/')({
  beforeLoad: createRouteGuard({
    requireAuth: true,
  }),
  component: Notifications,
});

function Notifications() {
  const [filter, setFilter] = useState('');

  const { data: profiles = [], isLoading: loadingProfiles } = useProfilesList();

  const filtered = useMemo(() => filterProfiles(profiles, filter), [profiles, filter]);

  const {
    sendToAll,
    setSendToAll,
    selectedUser,
    setSelectedUser,
    message,
    setMessage,
    isPending,
    handleSubmit,
    canSubmit,
  } = useAdminNotifactionsHook();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-md gap-4 p-6 shadow-lg rounded-2xl bg-zinc-800"
      >
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sendToAll}
            onChange={(e) => {
              setSendToAll(e.target.checked);
              if (e.target.checked) setSelectedUser(null);
            }}
            className="sr-only peer"
          />

          <div className="w-5 h-5 transition-colors duration-200 border-2 rounded-full border-zinc-500 peer-checked:bg-green-500 peer-checked:border-green-500" />

          <span className="text-sm font-medium text-zinc-300">Send to all users</span>
        </label>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">
            {sendToAll ? 'Recipients (all users)' : 'Recipient'}
          </label>
          {sendToAll ? (
            <p className="text-sm text-zinc-500">All users will receive this message.</p>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search by nickname or id..."
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                }}
                className="w-full px-3 py-2 text-white border rounded-lg border-zinc-600 bg-zinc-700 placeholder:text-zinc-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <ul
                role="listbox"
                aria-label="Select recipient"
                className="overflow-y-auto border rounded-lg max-h-48 border-zinc-600 bg-zinc-700/80"
              >
                {loadingProfiles ? (
                  <li className="px-3 py-4 text-sm text-center text-zinc-400">
                    Loading...
                  </li>
                ) : filtered.length === 0 ? (
                  <li className="px-3 py-4 text-sm text-center text-zinc-500">
                    No users found
                  </li>
                ) : (
                  filtered.map((user) => {
                    const { id } = user;
                    const isSelected = id && selectedUser === id;
                    return (
                      <li
                        key={id}
                        role="option"
                        tabIndex={0}
                        aria-selected={Boolean(isSelected)}
                        onClick={() => {
                          if (id) setSelectedUser(id);
                        }}
                        onKeyDown={(e) => {
                          if ((e.key === 'Enter' || e.key === ' ') && id) {
                            setSelectedUser(id);
                          }
                        }}
                        className={`flex cursor-pointer items-center gap-3 border-b border-zinc-600/50 px-3 py-2.5 text-sm text-zinc-200 last:border-b-0 hover:bg-zinc-600/50 ${isSelected ? 'bg-zinc-600/50 ring-2 ring-inset ring-green-400' : ''}`}
                      >
                        {user.profile_logo ? (
                          <img
                            src={getPublicAvatarUrl(user.profile_logo)}
                            alt=""
                            className="object-cover rounded-full size-8 shrink-0"
                          />
                        ) : null}
                        <span className="truncate">
                          {user.nickname ?? user.id ?? '—'}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-sm font-medium text-zinc-300">
            Message
          </label>
          <textarea
            id="message"
            placeholder="Write your message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            disabled={isPending}
            className="w-full p-4 text-white border resize-none min-h-40 rounded-xl border-zinc-600 bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 font-semibold text-black transition bg-green-400 cursor-pointer rounded-xl hover:bg-green-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? sendToAll
              ? 'Sending to all...'
              : 'Sending...'
            : sendToAll
              ? 'Send to all'
              : 'Send'}
        </button>
      </form>
    </div>
  );
}

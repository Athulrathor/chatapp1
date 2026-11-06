
import { useEffect, useMemo, useState } from "react";
import { Search, Users, MessageCircle } from "lucide-react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import SidebarSkeleton from "./skeletons/SidebarSkeleton.jsx";
import { getProfileImageUrl } from "../libs/utils.js";

const Sidebar = () => {
  const {
    getUsers,
    users,
    isUserLoading,
    selectedUser,
    setSelectedUser,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const [search, setSearch] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.fullname
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesOnline =
        !showOnlineOnly || onlineUsers.includes(user._id);

      return matchesSearch && matchesOnline;
    });
  }, [users, search, showOnlineOnly, onlineUsers]);

  if (isUserLoading) return <SidebarSkeleton />;

  return (
    <div className="flex h-full min-h-0 flex-col bg-base-100">
      {/* Header */}
      <div className="border-b border-base-300 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle size={21} />
            </div>

            <div>
              <h2 className="font-bold tracking-tight">Messages</h2>
              <p className="text-xs text-base-content/50">
                {users.length} contacts
              </p>
            </div>
          </div>

          <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            {onlineUsers.length} online
          </span>
        </div>

        {/* Search */}
        <label className="flex h-11 items-center gap-2 rounded-xl border border-base-300 bg-base-200/60 px-3 transition focus-within:border-primary">
          <Search size={17} className="shrink-0 text-base-content/40" />
          <input
            type="search"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/40"
          />
        </label>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-base-content/70">
          <input
            type="checkbox"
            className="checkbox checkbox-xs checkbox-primary"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
          />
          Show online only
        </label>
      </div>

      {/* Contact list */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <p className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-base-content/40">
          All conversations
        </p>

        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isSelected = selectedUser?._id === user._id;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`mb-1 flex w-full min-w-0 items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                isSelected
                  ? "bg-primary/10 ring-1 ring-primary/20"
                  : "hover:bg-base-200"
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={getProfileImageUrl(user.profilePic) || "/avatar.png"}
                  alt={user.fullname}
                  className="size-12 rounded-full object-cover ring-1 ring-base-300"
                />

                <span
                  className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-base-100 ${
                    isOnline ? "bg-success" : "bg-base-content/25"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {user.fullname}
                </p>
                <p className="mt-1 text-xs text-base-content/50">
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>

              {isSelected && (
                <span className="size-2 shrink-0 rounded-full bg-primary" />
              )}
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <Users size={28} className="mb-3 text-base-content/30" />
            <p className="text-sm font-medium">No contacts found</p>
            <p className="mt-1 text-xs text-base-content/50">
              Try another search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

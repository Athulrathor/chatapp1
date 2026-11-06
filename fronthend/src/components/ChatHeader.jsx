
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";
import { getProfileImageUrl } from "../libs/utils.js";

const ChatHeader = () => {
  const { onlineUsers } = useAuthStore();
  const { selectedUser, setSelectedUser } = useChatStore();

  const isOnline = onlineUsers.includes(selectedUser?._id);

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-base-300 bg-base-100 px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => setSelectedUser(null)}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl hover:bg-base-200 md:hidden"
          aria-label="Back to contacts"
        >
          <ArrowLeft size={20} />
        </button>

        <img
          src={getProfileImageUrl(selectedUser?.profilePic) || "/avatar.png"}
          alt={selectedUser?.fullname || "Profile"}
          className="size-10 shrink-0 rounded-full object-cover ring-1 ring-base-300"
        />

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold sm:text-base">
            {selectedUser?.fullname}
          </h3>

          <p className="flex items-center gap-1.5 text-xs text-base-content/50">
            <span
              className={`size-1.5 rounded-full ${
                isOnline ? "bg-success" : "bg-base-content/30"
              }`}
            />
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <button
        className="flex size-9 items-center justify-center rounded-xl text-base-content/60 hover:bg-base-200"
        aria-label="More options"
      >
        <MoreVertical size={20} />
      </button>
    </header>
  );
};

export default ChatHeader;


import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import ChatHeader from "../components/ChatHeader.jsx";
import MessageInput from "../components/MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { formatMessageTime, getProfileImageUrl } from "../libs/utils.js";

const ChatContainer = () => {
  const {
    message,
    getMessages,
    selectedUser,
    isMessageLoading,
    subscribedToMessage,
    unSubscribedToMessage,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribedToMessage();

    return () => unSubscribedToMessage();
  }, [
    selectedUser?._id,
    getMessages,
    subscribedToMessage,
    unSubscribedToMessage,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-base-200/30">
      <ChatHeader />

      {isMessageLoading ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
          <MessageSkeleton />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-5">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            {message?.map((mes, index) => {
              const isOwnMessage =
                String(mes?.senderId) === String(authUser?._id);

              const imageSrc =
                mes?.localImage || mes?.decryptedImage || mes?.image;

              return (
                <div
                  key={mes?._id || index}
                  className={`flex w-full items-end gap-2 ${
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <img
                    src={
                      isOwnMessage
                        ? getProfileImageUrl(authUser?.profilePic) || "/avatar.png"
                        : getProfileImageUrl(selectedUser?.profilePic) || "/avatar.png"
                    }
                    alt="Profile"
                    className="size-8 shrink-0 rounded-full object-cover"
                  />

                  <div
                    className={`flex max-w-[85%] min-w-0 flex-col sm:max-w-[70%] ${
                      isOwnMessage ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`overflow-hidden rounded-2xl px-3.5 py-2.5 shadow-sm ${
                        isOwnMessage
                          ? "rounded-br-sm bg-primary text-primary-content"
                          : "rounded-bl-sm border border-base-300 bg-base-100"
                      }`}
                    >
                      {imageSrc && (
                        <img
                          src={imageSrc}
                          alt="Message attachment"
                          className="mb-2 max-h-72 max-w-full rounded-xl object-contain"
                          loading="lazy"
                        />
                      )}

                      {mes?.text && (
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {mes.text}
                        </p>
                      )}
                    </div>

                    <time className="mt-1 px-1 text-[10px] text-base-content/40">
                      {formatMessageTime(mes?.createdAt)}
                    </time>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        </div>
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;

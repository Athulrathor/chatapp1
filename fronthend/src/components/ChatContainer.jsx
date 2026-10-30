import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore.js";
import ChatHeader from "../components/ChatHeader.jsx";
import MessageInput from "../components/MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
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
  const messageRef = useRef();

  useEffect(() => {
    if (messageRef.current && message.length) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);

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

  if (isMessageLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {message?.map((mes) => {
          const isOwnMessage = String(mes?.senderId) === String(authUser?._id);

          const imageSrc = mes?.localImage || mes?.decryptedImage || mes?.image;

          return (
            <div
              key={mes?._id}
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
              ref={messageRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isOwnMessage
                        ? getProfileImageUrl(authUser?.profilePic) || "/avatar.png"
                        : getProfileImageUrl(selectedUser?.profilePic) || "/avatar.png"
                    }
                    alt="Profile"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(mes?.createdAt)}
                </time>
              </div>

              <div className="chat-bubble flex flex-col gap-2">
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt="Attachment"
                    className="max-w-full sm:max-w-[200px] rounded-md"
                    loading="lazy"
                  />
                )}

                {message.decryptedImage && (
                  <img
                    src={message.decryptedImage}
                    alt="Shared image"
                    className="max-w-xs rounded-lg"
                  />
                )}

                {mes?.text && <p>{mes.text}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;

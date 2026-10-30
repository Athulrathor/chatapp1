import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore.js";
import ChatHeader from "../components/ChatHeader.jsx";
import MessageInput from "../components/MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
<<<<<<< HEAD
import { formatMessageTime } from "../libs/utils.js";
import nacl from "tweetnacl";
import * as util from "tweetnacl-util";
=======
import { formatMessageTime, getProfileImageUrl } from "../libs/utils.js";
>>>>>>> main

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

  const decryptMessage = (encryptedText, nonce, senderPublicKey) => {
    try {
      const receiverPrivateKey = localStorage.getItem("privateKey");

      if (!receiverPrivateKey) return "[Missing key]";

      const decrypted = nacl.box.open(
        util.decodeBase64(encryptedText),
        util.decodeBase64(nonce),
        util.decodeBase64(senderPublicKey),
        util.decodeBase64(receiverPrivateKey)
      );

      if (!decrypted) return "[Decryption failed]";

      return util.encodeUTF8(decrypted);

    } catch (err) {
      console.error("Decrypt error:", err);
      return "[Error decrypting message]";
    }
  };

  const decryptImage = (encryptedImage, nonce, senderPublicKey) => {
    try {
      const privateKeyBase64 = localStorage.getItem("privateKey");

      if (!privateKeyBase64) return null;

      const receiverPrivateKey = util.decodeBase64(privateKeyBase64);

      const decrypted = nacl.box.open(
        util.decodeBase64(encryptedImage),
        util.decodeBase64(nonce),
        util.decodeBase64(senderPublicKey),
        receiverPrivateKey
      );

      if (!decrypted) return null;

      return util.encodeUTF8(decrypted);

    } catch (err) {
      console.error("Decrypt image error:", err);
      return null;
    }
  };

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
<<<<<<< HEAD
        {message?.map((mes, index) => {

          const decryptedImage = mes.encryptedImage
            ? decryptImage(
              mes.encryptedImage,
              mes.nonce,
              mes.senderPublicKey
            )
            : null;

          const decryptedText = mes.encryptedText
            ? decryptMessage(
              mes.encryptedText,
              mes.nonce,
              mes.senderPublicKey
            )
            : null;
=======
        {message?.map((mes) => {
          const isOwnMessage = String(mes?.senderId) === String(authUser?._id);

          const imageSrc = mes?.localImage || mes?.decryptedImage || mes?.image;
>>>>>>> main

          return (
            <div
              key={mes?._id}
<<<<<<< HEAD
              className={`chat ${mes?.senderId === authUser?._id ? "chat-end" : "chat-start"
                }`}
              ref={index === message.length - 1 ? messageRef : null}
=======
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
              ref={messageRef}
>>>>>>> main
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
<<<<<<< HEAD
                      mes?.senderId === authUser?._id
                        ? authUser?.profilePic || "/avatar.png"
                        : selectedUser?.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
=======
                      isOwnMessage
                        ? getProfileImageUrl(authUser?.profilePic) || "/avatar.png"
                        : getProfileImageUrl(selectedUser?.profilePic) || "/avatar.png"
                    }
                    alt="Profile"
>>>>>>> main
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(mes?.createdAt)}
                </time>
              </div>

<<<<<<< HEAD
              <div className="chat-bubble flex flex-col">

                {decryptedImage && (
                  <img
                    src={decryptedImage}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}

                {decryptedText && (
                  <p>{decryptedText}</p>
                )}

=======
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
>>>>>>> main
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

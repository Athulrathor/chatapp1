// import React from 'react'

import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore.js";
import ChatHeader from "../components/ChatHeader.jsx";
import MessageInput from "../components/MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { formatMessageTime } from "../libs/utils.js";
import nacl from "tweetnacl";
import * as util from "tweetnacl-util";

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
    if (messageRef.current && message) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);
  
  useEffect(() => {
    getMessages(selectedUser._id);

    subscribedToMessage();

    return () => unSubscribedToMessage();
  }, [selectedUser, getMessages, subscribedToMessage, unSubscribedToMessage]);

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

          return (
            <div
              key={mes?._id}
              className={`chat ${mes?.senderId === authUser?._id ? "chat-end" : "chat-start"
                }`}
              ref={index === message.length - 1 ? messageRef : null}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      mes?.senderId === authUser?._id
                        ? authUser?.profilePic || "/avatar.png"
                        : selectedUser?.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(mes?.createdAt)}
                </time>
              </div>

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

              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
      
    </div>
  )
}

export default ChatContainer;

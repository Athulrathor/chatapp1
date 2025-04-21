// import React from 'react'

import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore.js";
import ChatHeader from "../components/ChatHeader.jsx";
import MessageInput from "../components/MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { formatMessageTime } from "../libs/utils.js";

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
        {message?.map((mes) => (
          <div key={mes?._id} className={`chat ${mes?.senderId === authUser?._id ? "chat-end" : "chat-start"}`} ref={messageRef} >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img src={mes?.senderId === authUser?._id ? authUser?.profilePic || "/avatar.png" : selectedUser?.profilePic || "/avatar.png"} alt={"profile pic"}/>
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(mes?.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex">
              {mes.image && (
                <img src={mes?.image} alt="Attachment" className="sm:max-w-[200px] rounded-md mb-2" />
              )}
              {mes?.text && <p>{mes?.text }</p>}
            </div>
          </div>
        )) }
      </div>

      <MessageInput />
      
    </div>
  )
}

export default ChatContainer;

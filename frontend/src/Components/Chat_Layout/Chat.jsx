import React from "react";
import Messages from "./Messages";
import Message_Input from "./Message_Input";
import SideBar from "../Layout_Manager/SideBar";

function Chat() {
  return (

      <div className="flex flex-col flex-1">

        <div className="h-16 bg-white border-b flex items-center px-4">
          <h2 className="font-semibold">Chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          <Messages text="Hello" send={true} />
          <Messages text="Hi there!" send={false} />
          <Messages text="How are you?" send={true} />
          <Messages text="I'm good, thanks! How about you?" send={false} />
          <Messages text="I'm doing well too!" send={true} />

        </div>

        <Message_Input />

      </div>
  );
}

export default Chat;

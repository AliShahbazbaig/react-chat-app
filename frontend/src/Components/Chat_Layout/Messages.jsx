import React from "react";

function Message({ text, send }) {
  return (
    <div
      className={`flex w-full mb-2 ${
        send ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 rounded-2xl max-w-xs text-sm ${
          send
            ? "bg-teal-600 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default Message;

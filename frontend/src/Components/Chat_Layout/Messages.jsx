import React from "react";

function Messages({ text, send }) {
  return (
    <div
      className={`w-fit px-4 py-2 my-2 rounded-2xl text-sm break-words shadow-sm
        ${send 
          ? "bg-blue-500 text-white ml-auto rounded-tr-none" 
          : "bg-gray-200 text-gray-800 mr-auto rounded-tl-none"
        }`}
    >
      <p className="m-0">{text}</p>
    </div>
  );
}

export default Messages;

// import React, { useEffect, useRef } from "react";

// function Messages({ messages = [], currentUserId }) {
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const formatTime = (timestamp) => {
//     if (!timestamp) return "";
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

//     if (diffDays === 0) {
//       return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//     } else if (diffDays === 1) {
//       return "Yesterday";
//     } else if (diffDays < 7) {
//       return date.toLocaleDateString([], { weekday: "short" });
//     } else {
//       return date.toLocaleDateString([], { month: "short", day: "numeric" });
//     }
//   };

//   return (
//     <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-3">
//       {messages.map((msg, index) => {
//         // Get sender ID from either sender_id or sender field
//         const senderId = msg.sender_id || msg.sender;
        
//         // FIXED: Ensure both are numbers for comparison
//         const isSender = Number(senderId) === Number(currentUserId);
        
//         // Check if this is the first message from this sender in the sequence
//         const prevMsg = messages[index - 1];
//         const prevSenderId = prevMsg ? (prevMsg.sender_id || prevMsg.sender) : null;
//         const showAvatar = index === 0 || Number(prevSenderId) !== Number(senderId);

//         return (
//           <div
//             key={msg.id || msg.uniqueId || index}
//             className={`flex ${isSender ? "justify-end" : "justify-start"} items-end gap-2`}
//           >
//             {/* Receiver Avatar (left side) */}
//             {!isSender && showAvatar && (
//               <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold shadow flex-shrink-0">
//                 {msg.sender_name?.[0] || msg.sender_name?.charAt(0) || "U"}
//               </div>
//             )}
//             {!isSender && !showAvatar && <div className="w-8 flex-shrink-0" />}

//             {/* Message Bubble */}
//             <div className={`flex flex-col max-w-[70%] ${isSender ? "items-end" : "items-start"}`}>
//               {!isSender && showAvatar && (
//                 <span className="text-xs text-gray-600 mb-1 ml-1 font-medium">
//                   {msg.sender_name || "User"}
//                 </span>
//               )}

//               <div
//                 className={`relative px-4 py-2 rounded-2xl shadow-md break-words text-sm whitespace-pre-wrap
//                   ${isSender
//                     ? "bg-green-500 text-white rounded-br-none"
//                     : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
//                   }`}
//               >
//                 {msg.text || msg.message}
                
//                 {/* FIXED: Read receipt display */}
//                 {isSender && (
//                   <span className="absolute -bottom-5 right-0 text-[10px] text-gray-400">
//                     {msg.is_read ? '✓✓' : '✓'}
//                   </span>
//                 )}
//               </div>

//               {/* Timestamp */}
//               <span className={`text-xs mt-1 ${isSender ? "text-gray-500" : "text-gray-400"}`}>
//                 {formatTime(msg.timestamp)}
//               </span>
//             </div>

//             {/* Sender Avatar (right side) */}
//             {isSender && showAvatar && (
//               <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold shadow flex-shrink-0 ml-2">
//                 {msg.sender_name?.[0] || "Me"}
//               </div>
//             )}
//             {isSender && !showAvatar && <div className="w-8 flex-shrink-0" />}
//           </div>
//         );
//       })}
//       <div ref={messagesEndRef} />
//     </div>
//   );
// }

// export default Messages;

import React, { useEffect, useRef } from "react";

function Messages({ messages = [], currentUserId }) {
  const messagesEndRef = useRef(null);

  // DEBUG: Log all messages and current user
  useEffect(() => {
    console.log('=== MESSAGES DEBUG ===');
    console.log('Current User ID:', currentUserId, 'Type:', typeof currentUserId);
    console.log('All Messages:', messages);
    
    messages.forEach((msg, index) => {
      console.log(`Message ${index}:`, {
        id: msg.id,
        sender_id: msg.sender_id,
        sender_id_type: typeof msg.sender_id,
        sender_name: msg.sender_name,
        text: msg.text || msg.message,
        isSentByMe: msg.isSentByMe,
        raw_message: msg
      });
    });
  }, [messages, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-3">
      {messages.map((msg, index) => {
        // Get sender ID from either sender_id or sender field
        const senderId = msg.sender_id || msg.sender;
        
        // Force both to numbers for comparison
        const isSender = Number(senderId) === Number(currentUserId);
        console.log(`Message ${index} details: `, {
          text: msg.text || msg.message,
          senderId: senderId,
          senderIdType: typeof senderId,
          currentUserId: currentUserId,
          currentUserIdType: typeof currentUserId,
          isSender: isSender,
          rawMsg: msg  // Full message object for inspection
        });
          
        // Check if this is the first message from this sender in the sequence
        const prevMsg = messages[index - 1];
        const prevSenderId = prevMsg ? (prevMsg.sender_id || prevMsg.sender) : null;
        const showAvatar = index === 0 || Number(prevSenderId) !== Number(senderId);


        return (
          <div
            key={msg.id || msg.uniqueId || index}
            className={`flex ${isSender ? "justify-end" : "justify-start"} items-end gap-2`}
          >
            {/* Receiver Avatar (left side) */}
            {!isSender && showAvatar && (
              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold shadow flex-shrink-0">
                {msg.sender_name?.[0] || msg.sender_name?.charAt(0) || "U"}
              </div>
            )}
            {!isSender && !showAvatar && <div className="w-8 flex-shrink-0" />}

            {/* Message Bubble */}
            <div className={`flex flex-col max-w-[70%] ${isSender ? "items-end" : "items-start"}`}>
              {!isSender && showAvatar && (
                <span className="text-xs text-gray-600 mb-1 ml-1 font-medium">
                  {msg.sender_name || "User"}
                </span>
              )}

              <div
                className={`relative px-4 py-2 rounded-2xl shadow-md break-words text-sm whitespace-pre-wrap
                  ${isSender
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                  }`}
              >
                {msg.text || msg.message}
                
                {/* Read receipt */}
                {isSender && (
                  <span className="absolute -bottom-5 right-0 text-[10px] text-gray-400">
                    {msg.is_read ? '✓✓' : '✓'}
                  </span>
                )}
              </div>

              {/* Timestamp */}
              <span className={`text-xs mt-1 ${isSender ? "text-gray-500" : "text-gray-400"}`}>
                {formatTime(msg.timestamp)}
              </span>
            </div>

            {/* Sender Avatar (right side) */}
            {isSender && showAvatar && (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold shadow flex-shrink-0 ml-2">
                {msg.sender_name?.[0] || "Me"}
              </div>
            )}
            {isSender && !showAvatar && <div className="w-8 flex-shrink-0" />}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default Messages;
import React, { useState, useRef, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

function Message_Input() {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { sendMessage, sendTypingStart, sendTypingStop, isConnected } = useSocket();

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      const lineHeight = 24;
      const maxHeight = lineHeight * 3;
      ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;
    
    sendMessage(inputValue);
    setInputValue("");
    sendTypingStop();
    setIsTyping(false);
  };

  const handleTyping = (e) => {
    setInputValue(e.target.value);

    if (!isTyping && e.target.value && isConnected) {
      setIsTyping(true);
      sendTypingStart();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingStop();
      }
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t p-4 bg-white">
      <div className="flex gap-2 bg-gray-100 rounded-full px-4 py-2 shadow-sm">
        <textarea
          ref={textareaRef}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          value={inputValue}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          disabled={!isConnected}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm focus:outline-none placeholder-gray-400 disabled:opacity-50"
          style={{
            lineHeight: "24px",
            paddingTop: "8px",
            paddingBottom: "6px",
            minHeight: "24px",
          }}
        />

        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || !isConnected}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-full p-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default Message_Input;
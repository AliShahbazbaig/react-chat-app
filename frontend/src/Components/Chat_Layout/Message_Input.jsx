import React, { useState, useRef, useEffect } from "react";

function Message_Input() {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea (max 3 lines)
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto"; // reset
      const lineHeight = 24; // adjust according to your text size
      const maxHeight = lineHeight * 3; // max 3 lines
      ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    console.log("Message sent:", inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full p-3 border-t bg-gray-100 dark:bg-gray-900">
      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm">

        {/* Auto-growing textarea */}
        <textarea
          ref={textareaRef}
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 resize-none
                     bg-transparent text-sm focus:outline-none
                     dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                     whitespace-pre-wrap break-words
                     text-left
                     box-border" // ensures padding included in height
          style={{
            lineHeight: "24px",      
            paddingTop: "8px",       
            paddingBottom: "6px",
            minHeight: "24px",       
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-full p-2 transition flex items-center justify-center"
        >
          ➤
        </button>

      </div>
    </div>
  );
}

export default Message_Input;

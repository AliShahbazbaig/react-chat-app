import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Chat from "./Chat";
import axios from "axios";

function Create_Chat() {

  const { userId } = useParams();  

  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    const token = document.cookie.split("token=")[1]?.split(";")[0];

    const createConversation = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/conversations/${userId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setConversationId(res.data.conversation_id);

        console.log(
          "Conversation ID:",
          res.data.conversation_id,
          "Created:",
          res.data.created
        );

      } catch (err) {
        console.error("Error fetching conversation:", err);
      }
    };

    if (userId) createConversation();   

  }, [userId]);

  return (
    <div>
      {conversationId && (
        <Chat
          conversationId={conversationId}
          otherUserId={userId} 
        />
      )}
    </div>
  );
}

export default Create_Chat;
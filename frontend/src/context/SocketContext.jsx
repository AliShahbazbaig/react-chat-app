import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [conversations, setConversations] = useState([]);
  const socketRef = useRef(null);
  const messageIdsRef = useRef(new Set());
  const currentConversationRef = useRef(null);
  const { token, user } = useAuth();

  const clearMessages = useCallback(() => {
    setMessages([]);
    messageIdsRef.current.clear();
  }, []);

  const markMessagesAsRead = useCallback(async (conversationId) => {
    if (!token || !conversationId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/conversations/${conversationId}/read/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Messages marked as read:', data);
      
      setMessages(prev => 
        prev.map(msg => ({
          ...msg,
          is_read: true
        }))
      );
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 } 
            : conv
        )
      );
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [token]);

  const connect = useCallback((conversationId) => {
    if (!token || !conversationId) {
      console.log('Cannot connect: Missing token or conversationId', { token: !!token, conversationId });
      return;
    }
    
    console.log('Attempting to connect to conversation:', conversationId);
    
    if (currentConversationRef.current === conversationId && 
        socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('Already connected to this conversation');
      return;
    }

    if (socketRef.current) {
      console.log('Closing existing socket connection');
      socketRef.current.close();
    }

    if (currentConversationRef.current !== conversationId) {
      console.log('Switching conversation, clearing messages');
      clearMessages();
    }

    const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/?token=${token}`;
    console.log('WebSocket URL:', wsUrl);
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully to conversation:', conversationId);
      setIsConnected(true);
      socketRef.current = ws;
      currentConversationRef.current = conversationId;
      markMessagesAsRead(conversationId);
    };

    // FIXED: Added the full message handling logic
    ws.onmessage = (event) => {
        console.log('📨 WebSocket message received RAW:', event.data);
        const data = JSON.parse(event.data);
        console.log('Parsed message data:', data);
        
        switch (data.type) {
            case 'message': {
            console.log('📝 Processing message:', data);
            
            // Create unique message ID
            const messageId = data.id || `${data.sender_id}-${data.timestamp}`;
            
            if (messageIdsRef.current.has(messageId)) {
                console.log('Duplicate message ignored:', messageId);
                return;
            }
            
            messageIdsRef.current.add(messageId);
            console.log('Added message ID to set:', messageId);
            
            const newMessage = {
                uniqueId: messageId,
                id: data.id || Date.now(),
                text: data.message,
                sender_id: data.sender_id,
                sender_name: data.sender_name,
                timestamp: data.timestamp,
                is_read: data.is_read || false,
                isSentByMe: data.sender_id === user?.id,
                conversation_id: data.conversation_id || conversationId
            };
            
            console.log('New message object:', newMessage);
            
            setMessages(prev => {
                const updated = [...prev, newMessage];
                console.log('Updated messages array:', updated);
                return updated;
            });
            
            // Update conversations list with latest message
            updateConversationsWithLatestMessage(newMessage);
            
            // If message is from someone else and we're in this conversation, mark as read
            if (data.sender_id !== user?.id && currentConversationRef.current === conversationId) {
                sendReadReceipt(data.id);
                markMessagesAsRead(conversationId);
            }
            break;
            }

            case 'typing':
            console.log('⌨️ Typing event:', data);
            if (data.status === 'start') {
                setTypingUsers(prev => ({
                ...prev,
                [data.user_id]: data.user_name || 'Someone'
                }));
                
                // Auto-clear typing after 3 seconds
                setTimeout(() => {
                setTypingUsers(prev => {
                    const newState = { ...prev };
                    delete newState[data.user_id];
                    return newState;
                });
                }, 3000);
            } else {
                setTypingUsers(prev => {
                const newState = { ...prev };
                delete newState[data.user_id];
                return newState;
                });
            }
            break;

            case 'read_receipt':
            console.log('👁️ Read receipt:', data);
            setMessages(prev => 
                prev.map(msg => 
                msg.id === data.message_id ? { ...msg, is_read: true } : msg
                )
            );
            break;

            default:
            console.log('Unknown message type:', data);
        }
        };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      setIsConnected(false);
      socketRef.current = null;
      
      if (currentConversationRef.current === conversationId) {
        currentConversationRef.current = null;
      }
    };
  }, [token, user, clearMessages, markMessagesAsRead]);

  const sendReadReceipt = useCallback((messageId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'read_receipt',
        message_id: messageId
      }));
    }
  }, []);

  const updateConversationsWithLatestMessage = useCallback((messageData) => {
    setConversations(prev => {
      const updated = [...prev];
      const index = updated.findIndex(c => c.id === messageData.conversation_id);
      
      if (index !== -1) {
        const isFromOther = messageData.sender_id !== user?.id;
        const currentUnread = updated[index].unread_count || 0;
        
        updated[index] = {
          ...updated[index],
          last_message: messageData.text,
          last_message_time: messageData.timestamp,
          unread_count: isFromOther && currentConversationRef.current !== messageData.conversation_id
            ? currentUnread + 1
            : isFromOther ? currentUnread : 0
        };
      }
      
      // Sort conversations by latest message (most recent first)
      return updated.sort((a, b) => {
        const timeA = a.last_message_time ? new Date(a.last_message_time) : new Date(0);
        const timeB = b.last_message_time ? new Date(b.last_message_time) : new Date(0);
        return timeB - timeA;
      });
    });
  }, [user]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      currentConversationRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((text) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'message',
        message: text
      }));
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  }, []);

  const sendTypingStart = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 
        type: 'typing_start',
        user_name: user ? `${user.first_name} ${user.last_name}`.trim() : 'Someone'
      }));
    }
  }, [user]);

  const sendTypingStop = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'typing_stop' }));
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/chats/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [token]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{
        isConnected,
        messages,
        setMessages, // Make sure this is here!
        typingUsers,
        conversations,
        connect,
        disconnect,
        sendMessage,
        sendTypingStart,
        sendTypingStop,
        fetchConversations,
        clearMessages,
        markMessagesAsRead,
        currentConversation: currentConversationRef.current
    }}>
        {children}
    </SocketContext.Provider>
  );
};
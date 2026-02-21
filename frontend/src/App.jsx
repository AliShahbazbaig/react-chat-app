import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login_Form from './Components/User_Registration/Login_Form';
import Sign_Up_Form from './Components/User_Registration/Sign_Up_Form';
import Header from './Components/Layout_Manager/Nav_Bar';
import Chats from './Components/Chat_Layout/Chats';
import Chat from './Components/Chat_Layout/Chat';
import ProtectedRoute from './utls/Protected_Route/Protected_Route';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Header />
          <Routes>
            <Route path="/" element={<h1>Hello from Home Page</h1>} />
            <Route path="/login" element={<Login_Form />} />
            <Route path="/signup" element={<Sign_Up_Form />} />
            <Route path="/chats" element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            } />
            <Route path="/chat/:conversationId" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
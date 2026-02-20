import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Components/Layout_Manager/Nav_Bar';
import Login_Form from './Components/User_Registration/Login_Form';
import Sign_Up_Form from './Components/User_Registration/Sign_Up_Form';
import ProtectedRoute from './utls/Protected_Route/Protected_Route';
import User_Profile from './Components/Layout_Manager/User_Profile'
import User_Cards from './Components/Layout_Manager/User_Cards';
import Groups from './Components/Group_Chats/Groups'
import Chats from './Components/Chat_Layout/Chats';
import Create_Chat from './Components/Chat_Layout/Create_Chat';
import './index.css';

function App() {
  return (
    <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<h1>Hello from Home Page</h1>} />
            <Route path="/login" element={<Login_Form />} />
            <Route path="/signup" element={<Sign_Up_Form />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <User_Profile />
              </ProtectedRoute>
            } />
            <Route path='/users' element={
              <ProtectedRoute>
                <User_Cards />
              </ProtectedRoute>
            } 
            />
            <Route path='/groups' element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            }
            />
            <Route path='/chats' element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
            />
            <Route path='/new/chat/:userId' element={
              <ProtectedRoute>
                <Create_Chat />
              </ProtectedRoute>
            }
            />
          </Routes>
    </BrowserRouter>
  );
}

export default App;
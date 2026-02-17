import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login_Form from './Components/User_Registration/Login_Form'
import Sign_Up_Form from './Components/User_Registration/Sign_Up_Form'
import Header from './Components/Layout_Manager/Nav_Bar'
import Chat from './Components/Chat_Layout/Chat'
import './index.css'
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="*" element={<h1>Hello from Home Page</h1>} />
        <Route path="/login" element={<Login_Form />} />
        <Route path="/signup" element={<Sign_Up_Form />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

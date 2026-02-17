import React from 'react'
import Chat from './Chat'
import SideBar from '../Layout_Manager/SideBar'
import ProtectedRoute from '../../utls/Protected_Route/Protected_Route'

function Chats() {
  return (
      <div className="flex h-screen bg-gray-100">
      <SideBar />
      <Chat />
      </div>
  )
}

export default Chats

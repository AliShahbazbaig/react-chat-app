import React from 'react'
import Chat from './Chat'
import SideBar from '../Layout_Manager/SideBar'
import ProtectedRoute from '../../utls/Protected_Route/Protected_Route'

function Chats() {
  return (
     <div className="flex h-screen bg-gray-100">
        <div className="w-72 flex-shrink-0">
          <SideBar />
        </div>
        <Chat />

      </div>

  )
}

export default Chats

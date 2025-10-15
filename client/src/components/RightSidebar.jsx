import React, { useContext, useEffect, useState } from 'react'
import assets, { imagesDummyData } from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'

const RightSidebar = () => {

  const {selectedUser,messages} = useContext(ChatContext)
  const {logout,onlineUsers} = useContext(AuthContext)
  
  const [mediaItems, setMediaItems] = useState([]);

  //Get all the images from the messages & set them to state
  useEffect(()=>{
     if (!messages) return;
    
    const items = messages
      .filter(msg => msg.image|| msg.file) .map(msg=> ({
        type: msg.image ? 'image' : 'file',
        url: msg.image || msg.file,
        name: msg.fileName || '', // for files
        fileType: msg.fileType || '',
    }));
    setMediaItems(items);
  },[messages]);
  if (!selectedUser) return null;

  return selectedUser &&(
    <div className="bg-[#0F0F1C] text-white w-full h-full flex flex-col overflow-hidden">
       {/* Scrollable content */}
       <div className="flex-1 overflow-y-auto px-5 pt-16 pb-6 space-y-6">
       {/* User Info */}
        <div className='flex flex-col items-center gap-2 text-xs font-light mx-auto'>
          <img 
           src={selectedUser?.profilePic || assets.arrow_icon} alt="" className="w-20 h-20 object-cover rounded-full"/>
          <h1 className="text-xl font-medium flex items-center gap-2">
            {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
            {selectedUser.fullName}
          </h1>
          <p className="text-center px-2">{selectedUser.bio}</p>

        </div>
        <hr className='border-[#ffffff50] '/>
        {/*MEDIA section */}
        <div >
          <p className="text-sm font-medium mb-2">
            Media
          </p>
          {mediaItems.length === 0 ? (
            <p className="text-gray-400 text-xs">No media shared yet.</p>
          ) :(
          <div className=' grid grid-cols-2 gap-4'>
            {mediaItems.map((item,index)=>(
              <div key={`${item.url} -${index}`} onClick={()=>window.open(item.url)}
               className="cursor-pointer rounded p-1 bg-[#ffffff10] flex items-center justify-center"
              >
               {item.type === 'image'?(
                <img
                  src={item.url}
                  alt="media"
                  className="w-full h-auto object-cover rounded-md"
                />
              ):(
                <div className="flex flex-col items-center justify-center text-xs text-white">
                  <img src={assets.file_icon} alt="file" className="w-6 mb-1" />
                  <p className="truncate max-w-[80px]">{item.name}</p>
                  <p className="text-[10px] text-gray-300">
                    {item.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                  </p>
              </div>
            )}
           </div>
          ))}
        </div>
        
       )}
      </div>
     
     <div className="flex justify-center pt-4">
        <button  onClick={()=> logout()} className="bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm font-light py-2 px-12 rounded-full">
          Logout
        </button>
      </div>
    </div>
    </div>
  )
}  
export default RightSidebar

import User from "../models/User.js"
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import {io,userSocketMap} from "../server.js"

//Get all users except the logged in user
export const getUserForSidebar = async(req,res)=>{
    try{
        const userId =req.user._id;
    
        const filteredUsers = await User.find({_id:{$ne:userId}}).select("-password");
    
    
    
        //Count no of  messages not sent
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId:user._id,receiverId:userId,seen:false})
            if(messages.length >0){
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success:true,users:filteredUsers,unseenMessages})
    
    
    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})

    }

}

//Get all messages for selected user
export const getMessage = async(req,res)=>{
    try{
        const{id:selectedUserId} = req.params;
        const myId = req.user._id;


    const messages = await Message.find({
        $or:[
            {senderId:myId,receiverId: selectedUserId},
            {senderId: selectedUserId, receiverId: myId},
        ],
    });
    await Message.updateMany({senderId: selectedUserId,receiverId:myId},{seen:true});

    res.json({success:true,messages})

    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})


    }
}
//API to mark message as seen using message id
export const markMessageAsSeen = async (req,res)=>{
    try{
        const {id} = req.params;
        await Message.findByIdAndUpdate(id,{seen:true})
        res.json({success:true})
    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//send message to selected user
export const sendMessage = async (req,res)=>{
    try{
        const {text,image,file, fileName, fileType} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        let fileUrl;
        
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;

        }

         if (file) {
            const uploadResponse = await cloudinary.uploader.upload(file, {
            resource_type: "raw", // important for non-image files
            folder: "chat_files",
            public_id: fileName.split(".")[0], // optional
        });
          fileUrl = uploadResponse.secure_url;
        }


        const newMessage =await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            file: fileUrl,
            fileName,
            fileType,

        });

        //emit the new message to the receivers socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        res.json({success:true,newMessage});
    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
};
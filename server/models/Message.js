import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
    senderId: {type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    receiverId: {type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
   
    text:{type:String},
    image:{type:String},

    file: { type: String },         // URL to file on Cloudinary
    fileName: { type: String },     // original file name, e.g. "resume.pdf"
    fileType: { type: String },

    seen:{type:Boolean,default:false},
},{timestamps:true});

const Message = mongoose.model("Message",messageSchema);

export default Message;
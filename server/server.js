import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";


//Create Express app and HTTP server
const app= express();
const server=http.createServer(app)

///Initialize socket.io server
export const io = new Server(server,{
    cors:{
        origin:process.env.CLIENT_URL || "http://localhost:5173",
     }
})

//store online users
export const userSocketMap = {};//{userId:socketId}

//Socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query?.userId;
    console.log("User Connected",userId);

    if(!userId) {
        console.warn("⚠️ userId missing on connection");
        return;
    }
    
    userSocketMap[userId] = socket.id;
        

    //emit  online users to all connected elements
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User Dissconnect",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    })
})


//Middleware Setup
app.use(express.json({limit:"4mb"}));
app.use(
    cors({
         origin: process.env.CLIENT_URL || "http://localhost:5173",
    }));

app.get("/", (req, res) => {
  res.send("✅ Server is running! Welcome to the backend.");
});


//Route setup
app.use("/api/status",(req,res)=> res.send("Server is live"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);

//Connect to MongoDB
try {
  await connectDB();
  console.log("✅ MongoDB connected");
} catch (err) {
  console.error("❌ MongoDB connection failed:", err);
  process.exit(1); // stop server if DB fails
}




const PORT = process.env.PORT || 5002;
const NODE_ENV = process.env.NODE_ENV || "development";

console.log("👉 Current NODE_ENV:",NODE_ENV);
console.log("👉 PORT from env:", process.env.PORT);


server.listen(PORT, () => console.log(`✅ Server running on PORT: ${PORT}`));


// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🔴 Server shutting down...");
  io.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🔴 Server terminated...");
  io.close();
  process.exit(0);
});

 //export  server for Vervel
 export default server;
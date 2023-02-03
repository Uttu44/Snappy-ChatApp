const express = require("express");
const cors =require("cors");
const mongoose = require("mongoose");
const messageRoutes = require("./routes/messagesRoute");
const authRoutes = require("./routes/auth");
const app = express();
const socket = require("socket.io");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");

app.use(cors())
app.use(express.json());

app.use("/api/auth",userRoutes);

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
}).then(()=>{
    console.log("DB connection successfully");
}).catch((err)=>{
    console.log(err.message);
});

app.use("api/auth",authRoutes);
app.use("/api/messages", messageRoutes);

const server =app.listen(process.env.PORT,()=>
    console.log(`Server started on Port ${process.env.PORT}`)
);

app.use("/api/auth", userRoutes);

const io = socket(server,{
    cors:{
        
        // origin:process.env.ORIGIN,
        origin:"http://localhost:3000",
        Credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection",(socket)=>{
    global.chatSocket = socket;
    socket.on("add-user",(userId)=> {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg",(data)=> {
        const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
    });
})


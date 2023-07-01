const express = require("express")

const cors = require("cors")

const mongoose = require("mongoose")

const userRoutes = require("./routes/userRoutes")

const messageRoutes = require("./routes/messagesRoutes")

const path = require("path");

const app = express()


const socket = require('socket.io')


require("dotenv").config()

app.use(cors())

app.use(express.json())

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages/homepage.html"));
});


app.use('/api/auth', userRoutes)

app.use('/api/messages', messageRoutes)


mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log(`Db Connected Successfully`);
}).catch((err)=>{
    console.log(err);
})

const server = app.listen(process.env.PORT, ()=>{
    console.log(`Sever running on http://localhost:${process.env.PORT}`)
})


const io = socket(server, {
    cors: {
        origin : "http://localhost:3006",
        credentials: true,
    }
})


global.onlineUsers = new Map()

io.on('connection', (socket)=>{
    global.chatSocket = socket
    socket.on('add-user', (userId)=>{
        onlineUsers.set(userId, socket.id)
    })
    socket.on('send-msg', (data)=>{
        const sendUserSocket = onlineUsers.get(data.to)
        if(sendUserSocket){
            socket.to(sendUserSocket).emit('msg-recieve', data.message)
        }
    })
})
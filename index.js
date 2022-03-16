require('dotenv').config()
const app = require('./config/app');
const port = process.env.PORT || 8081;


const server = app.listen(port,()=>{
    console.log(`Apps is running on port: ${port}`);
})

const io = require("socket.io")(server, {
    // pingTimeout: 60000,
    cors: {
      origin: "*",
//         origin: "http://localhost:3000",
//       credentials: true,
    },
  });

  io.use((socket, next) => {
    const user = socket.handshake.auth.user;
    if (!user) {
      return next(new Error("invalid username"));
    }
    socket.user = user;
    next();
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
        if (users.filter(e => e.userID == socket.user.id).length == 0) {
            users.push({
            socketId:id,
            userID: socket.user.id,
            user: socket.user,
            });
        }
    }
    
    socket.on("join room",(roomID) => {
        socket.join(roomID);
    })
    socket.on("send message",(content) => {
        socket.broadcast.to(content.roomId).emit('recieve message', content.data);
    })
    socket.on("disconnect", (reason) => {
        console.log(users)
        socket.disconnect()
    });
  })

module.exports = server;

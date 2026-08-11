const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const route = require("./routes/client/index.router")
const cookieParser = require('cookie-parser');
const routeAdmin = require("./routes/admin/index.route")
const cors = require('cors');
require('dotenv').config()

const database = require("./config/database")

database.connect()



const http = require('http');
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://oder-xi.vercel.app"],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true
  }
});

const ChatMessage = require("./models/chat-message.model"); // Import the model

// Make io accessible to our router
app.set('io', io);

io.on("connection", (socket) => {
  console.log("🔥 Client connected to socket.io: " + socket.id);
  
  // Join a specific chat room (e.g., support)
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Handle sending message
  socket.on("send_message", async (data) => {
    try {
      // data: { room, sender, text, time }
      const newMsg = new ChatMessage(data);
      await newMsg.save();
      
      // Emit to everyone in the room
      io.to(data.room).emit("receive_message", data);

      // Notify the restaurant globally for the bell notification
      if (data.sender !== "restaurant" && data.room && data.room.includes("_res_")) {
          const parts = data.room.split("_res_");
          if (parts.length === 2) {
             const restaurantId = parts[1];
             io.to(`restaurant_global_${restaurantId}`).emit("restaurant_notification", { type: 'chat', data });
          }
      }
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    // data: { room, sender, isTyping }
    socket.to(data.room).emit("user_typing", data);
  });
  
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected from socket.io: " + socket.id);
  });
});



// app.use(cors({ origin: "http://localhost:3000" }));
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://oder-xi.vercel.app"
  ],
  credentials: true
}));

// app.use(cors());
app.use(express.json());
app.use(cookieParser());

// TinyMCE
    // app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// End TinyMCE


// Route
route(app)
routeAdmin(app)


server.listen(port, () => console.log(`🚀 Server đang chạy tại http://localhost:${port} cùng WebSocket`));

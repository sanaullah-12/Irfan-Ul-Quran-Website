const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config({ path: ".env.local" });

const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const contactRoutes = require("./routes/contact");
const classRoutes = require("./routes/classes");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");
const teacherRoutes = require("./routes/teacher");
const resourceRoutes = require("./routes/resources");
const notificationRoutes = require("./routes/notifications");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/quran-learning",
  )
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/notifications", notificationRoutes);

// WebRTC Socket.io for Live Classes
const rooms = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-room", ({ roomId, userId, userName }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push({ socketId: socket.id, userId, userName });

    // Notify others in the room
    socket.to(roomId).emit("user-connected", { userId, userName });

    // Send existing users to the new user
    const existingUsers = rooms[roomId].filter(
      (user) => user.socketId !== socket.id,
    );
    socket.emit("existing-users", existingUsers);

    console.log(`User ${userName} joined room ${roomId}`);
  });

  socket.on("signal", ({ to, signal, from }) => {
    io.to(to).emit("signal", { signal, from });
  });

  socket.on("screen-share-start", ({ roomId }) => {
    socket.to(roomId).emit("screen-share-started");
  });

  socket.on("screen-share-stop", ({ roomId }) => {
    socket.to(roomId).emit("screen-share-stopped");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Remove user from rooms
    Object.keys(rooms).forEach((roomId) => {
      const userIndex = rooms[roomId].findIndex(
        (user) => user.socketId === socket.id,
      );
      if (userIndex !== -1) {
        const user = rooms[roomId][userIndex];
        rooms[roomId].splice(userIndex, 1);
        socket.to(roomId).emit("user-disconnected", user.userId);

        // Clean up empty rooms
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

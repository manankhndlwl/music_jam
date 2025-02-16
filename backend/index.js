import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import roomRoutes from "./src/routes/roomRoutes.js";
import mongoose from "mongoose";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);

export const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/api/room", roomRoutes);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

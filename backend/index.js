import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import roomRoutes from "./src/routes/roomRoutes.js";
import mongoose from "mongoose";
import { Server } from "socket.io";
import http from "http";
import { Room } from "./src/schema/roomSchema.js";

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

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  const { roomCode } = socket.handshake.query;
  if (!roomCode) return socket.disconnect();

  socket.join(roomCode);

  // 🟢 Fetch or create room
  let room = await Room.findOne({ code: roomCode });
  if (!room) {
    room = await Room.create({ code: roomCode, songsQueue: [] });
  }
  socket.emit("update_queue", room.songsQueue);

  // 🟢 Add a song
  socket.on("add_song", async (song) => {
    console.log("songs======>adding::", song);
    try {
      const updatedRoom = await Room.findOneAndUpdate(
        { code: roomCode },
        { $push: { songsQueue: song } },
        { new: true, upsert: true }
      );
      io.to(roomCode).emit("update_queue", updatedRoom.songsQueue);
    } catch (error) {
      console.log("error in adding song", error?.response);
    }
  });

  // 🟢 Remove a song
  socket.on("remove_song", async (songId) => {
    const updatedRoom = await Room.findOneAndUpdate(
      { code: roomCode },
      { $pull: { songsQueue: { id: songId } } },
      { new: true }
    );
    io.to(roomCode).emit("update_queue", updatedRoom.songsQueue);
  });

  // 🟢 Clear the queue
  socket.on("clear_queue", async () => {
    await Room.findOneAndUpdate({ code: roomCode }, { songsQueue: [] });
    io.to(roomCode).emit("update_queue", []);
  });

  socket.on("play", (roomCode) => {
    console.log("emited", roomCode);
    io.to(roomCode).emit("play");
  });

  socket.on("pause", (roomCode) => {
    io.to(roomCode).emit("pause");
  });

  socket.on("seek", ({ roomCode, time }) => {
    io.to(roomCode).emit("seek", time);
  });

  socket.on("nextSong", ({ roomCode, nextSong }) => {
    io.to(roomCode).emit("updateState", { currentSong: nextSong });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

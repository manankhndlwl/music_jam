import { Room } from "../schema/roomSchema.js";
import { nanoid } from "nanoid";
import { io } from "../../index.js";

export const createRoom = async (req, res) => {
  try {
    const roomCode = nanoid(6);
    const room = new Room({ code: roomCode });
    await room.save();
    res.status(201).json({ roomCode });
  } catch (error) {
    res.status(500).json({ message: "Error creating room", error });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { code } = req.body;
    const room = await Room.findOne({ code });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res
      .status(200)
      .json({ message: "Joined room successfully", roomCode: room.code });
  } catch (error) {
    res.status(500).json({ message: "Error joining room", error });
  }
};

export const addSong = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { videoId, title, artist } = req.body;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const newSong = { videoId, title, artist, votes: 0 };
    room.songsQueue.push(newSong);
    await room.save();

    io.to(roomId).emit("songAdded", newSong);

    res.status(200).json({ message: "Song added successfully", song: newSong });
  } catch (error) {
    res.status(500).json({ message: "Error adding song", error });
  }
};

export const voteSong = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { videoId, voteType } = req.body; // voteType = 'up' or 'down'

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const song = room.songsQueue.find((song) => song.videoId === videoId);
    if (!song) {
      return res.status(404).json({ message: "Song not found in queue" });
    }

    song.votes += voteType === "up" ? 1 : -1;
    await room.save();

    io.to(roomId).emit("voteUpdated", song);

    res.status(200).json({ message: "Vote updated successfully", song });
  } catch (error) {
    res.status(500).json({ message: "Error updating vote", error });
  }
};

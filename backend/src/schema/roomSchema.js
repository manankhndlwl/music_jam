import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
  id: String, // YouTube video ID
  title: String,
  artist: String,
  addedAt: { type: Date, default: Date.now },
});

const RoomSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  songsQueue: [SongSchema],
});

export const Room = mongoose.model("Room", RoomSchema);

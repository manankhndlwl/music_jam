import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  songsQueue: { type: [Object], default: [] },
});

export const Room = mongoose.model("Room", RoomSchema);

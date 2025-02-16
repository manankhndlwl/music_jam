"use client";
import { useState } from "react";
import axiosInstance from "@/axiosInstance";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const createRoom = async () => {
    try {
      const res = await axiosInstance.post("/room/create");
      setRoomCode(res.data.roomCode);
      console.log("🚀 ~ createRoom ~ res.data.roomCode:", res.data.roomCode);
      router.push(`/room/${res.data.roomCode}`);
      setError("");
    } catch (err) {
      setError("Error creating room");
    }
  };

  const joinRoom = async () => {
    try {
      const res = await axiosInstance.post("/room/join", {
        code: inputCode,
      });
      console.log("join room", res.data.roomCode);
      setRoomCode(res.data.roomCode);
      router.push(`/room/${res.data.roomCode}`);
      setError("");
    } catch (err) {
      setError("Room not found");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Room Music App</h1>
      {roomCode ? (
        <p className="text-lg font-semibold">Room Code: {roomCode}</p>
      ) : (
        <>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
            onClick={createRoom}
          >
            Create Room
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              className="border px-2 py-1 rounded-md"
              placeholder="Enter Room Code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md"
              onClick={joinRoom}
            >
              Join Room
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
}

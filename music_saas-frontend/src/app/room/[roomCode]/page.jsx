// app/room/[roomCode]/page.tsx
"use client";

import { useParams } from "next/navigation";

export default function MusicRoom() {
  const { roomCode } = useParams();
  console.log("🚀 ~ MusicRoom ~ roomCode:", roomCode);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      {/* Song Queue Section */}
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Songs Queue</h2>
        <ul className="list-disc pl-5">
          <li>Song 1 - Artist</li>
          <li>Song 2 - Artist</li>
          <li>Song 3 - Artist</li>
        </ul>
      </div>

      {/* Add Song Section */}
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-4 mt-4">
        <h2 className="text-lg text-black font-semibold mb-2">Add a Song</h2>
        <form className="flex gap-2">
          <input
            type="text"
            placeholder="Enter YouTube URL"
            className="border px-2 py-1 rounded-md w-full"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

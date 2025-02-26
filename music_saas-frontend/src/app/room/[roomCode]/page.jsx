"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import YouTube from "react-youtube";
import { useQueueStore } from "../../../store/useQueueStore";

export default function MusicRoom() {
  const { roomCode } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { queue, initializeSocket, addSong, removeSong, socket } =
    useQueueStore();
  const [currentSong, setCurrentSong] = useState(null); // Currently playing song
  const playerRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (roomCode) initializeSocket(roomCode);
    // socket?.on("play", () => {
    //   console.log("emitted ply.....");
    //   playerRef.current?.playVideo();
    // });
    // socket?.on("pause", () => playerRef.current?.pauseVideo());
    // socket?.on("seek", (time) => playerRef.current?.seekTo(time, true));

    // socket?.on("updateState", (data) => {
    //   setCurrentSong(data.currentSong);
    // });
  }, [roomCode]);

  useEffect(() => {
    if (!socket) return; // Ensure socket is initialized

    socket.on("play", () => {
      console.log("Play event received");
      playerRef.current?.playVideo();
    });

    socket.on("pause", () => {
      console.log("Pause event received");
      playerRef.current?.pauseVideo();
    });

    socket.on("seek", (time) => {
      console.log("Seek event received:", time);
      playerRef.current?.seekTo(time, true);
    });

    socket.on("updateState", (data) => {
      console.log("UpdateState event received:", data);
      setCurrentSong(data.currentSong);
    });

    return () => {
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
      socket.off("updateState");
    };
  }, [socket]);

  // Auto-play first song when queue updates
  useEffect(() => {
    if (queue.length > 0 && !currentSong) {
      setCurrentSong(queue[0]); // Set first song as currently playing
    }
  }, [queue]);

  // Fetch YouTube search results
  const searchYouTube = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const res = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: "snippet",
            q: searchQuery,
            key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
            maxResults: 5,
            type: "video",
          },
        }
      );
      setSearchResults(res.data.items);
    } catch (error) {
      console.error("Error fetching YouTube data:", error);
    }
  };

  // Add song to queue
  const addSongToQueue = (video) => {
    const newSong = {
      id: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.default.url,
      roomCode,
    };
    addSong(newSong);
    setSearchResults([]); // Clear search results
    setSearchQuery(""); // Clear input field
  };

  // YouTube Player Options
  const opts = {
    height: "360",
    width: "500",
    playerVars: {
      autoplay: 1, // Auto-play the video
    },
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
  };

  const handlePlay = () => {
    socket.emit("play", roomCode);
    console.log("pkayer ref=====>", playerRef?.current);
    playerRef.current?.playVideo();
  };

  const handlePause = () => {
    socket.emit("pause", roomCode);
    playerRef.current?.pauseVideo();
  };

  const handleSeek = () => {
    const currentTime = playerRef.current?.getCurrentTime();
    socket.emit("seek", { roomCode, time: currentTime });
  };

  const handleNextSong = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      removeSong(nextSong.id);
      socket.emit("nextSong", { roomCode, nextSong });
    }
  };

  // Handle when song finishes
  const handleSongEnd = () => {
    removeSong(currentSong.id); // Remove finished song from queue
    if (queue.length > 1) {
      setCurrentSong(queue[1]); // Play next song
    } else {
      setCurrentSong(null); // No more songs left
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold">Room: {roomCode}</h1>

      {/* YouTube Player Section */}
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">Now Playing</h2>
        {currentSong ? (
          <>
            <div className="flex flex-col items-center">
              <YouTube
                videoId={currentSong.id}
                opts={opts}
                onEnd={handleNextSong}
                onPause={handlePause}
                onPlay={handlePlay}
                onReady={onPlayerReady}
              />
              <p className="mt-2 font-semibold">{currentSong.title}</p>
            </div>
            <div className="flex gap-4 mt-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md"
                onClick={handlePlay}
              >
                Play
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={handlePause}
              >
                Pause
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={handleSeek}
              >
                Sync
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">No song playing.</p>
        )}
      </div>

      {/* Song Queue Section */}
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">Songs Queue</h2>
        {queue.length === 0 ? (
          <p className="text-gray-500">No songs in queue.</p>
        ) : (
          <ul className="list-disc gap-10 pl-5">
            {queue.map((song) => (
              <li
                key={song.id}
                className="flex mb-2 justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-12 h-12 rounded-md"
                  />
                  <span>{song.title}</span>
                </div>
                <button
                  className="text-red-500 font-bold"
                  onClick={() => removeSong(song.id)}
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Song Section */}
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-4 mt-4">
        <h2 className="text-lg text-black font-semibold mb-2">Add a Song</h2>
        <form onSubmit={searchYouTube} className="flex gap-2">
          <input
            type="text"
            placeholder="Search YouTube songs"
            className="border px-2 py-1 rounded-md w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Search
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <ul className="mt-4 bg-white shadow-md rounded-lg p-2">
            {searchResults.map((video) => (
              <li
                key={video.id.videoId}
                className="flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => addSongToQueue(video)}
              >
                <img
                  src={video.snippet.thumbnails.default.url}
                  alt={video.snippet.title}
                  className="w-10 h-10 rounded-md"
                />
                <span>{video.snippet.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

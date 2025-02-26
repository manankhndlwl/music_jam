import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { io, Socket } from "socket.io-client";

interface Song {
  id: string;
  title: string;
  artist: string;
}

interface QueueState {
  queue: Song[];
  socket: Socket | null;
  initializeSocket: (roomCode: string) => void;
  addSong: (song: Song) => void;
  removeSong: (id: string) => void;
  setQueue: (queue: Song[]) => void;
  clearQueue: () => void;
}

export const useQueueStore = create(
  persist<QueueState>(
    (set, get) => ({
      queue: [],
      socket: null,

      initializeSocket: (roomCode) => {
        if (get().socket) return; // Prevent multiple socket connections

        const socket = io("http://localhost:5000", {
          query: { roomCode },
        });

        socket.on("update_queue", (newQueue: Song[]) => {
          console.log("updated queue======>",newQueue)
          set({ queue: newQueue });
        });

        set({ socket });
      },


      addSong: (song) => {
        const { socket } = get();
        set((state) => ({ queue: [...state.queue, song] }));
        if (socket) socket.emit("add_song", song);
      },

      removeSong: (id) => {
        const { socket } = get();
        set((state) => ({
          queue: state.queue.filter((song) => song.id !== id),
        }));
        socket.emit("remove_song", id);
      },

      setQueue: (queue) => set({ queue }),

      clearQueue: () => {
        const { socket } = get();
        set({ queue: [] });
        socket.emit("clear_queue");
      },

      
    }),
    {
      name: "music-queue-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Exclude `socket` from persistence
        ...state,
        socket: undefined,
      }),
    }
  )
);

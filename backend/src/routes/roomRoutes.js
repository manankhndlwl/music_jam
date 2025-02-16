import express from "express";
import {
  addSong,
  createRoom,
  joinRoom,
  voteSong,
} from "../controllers/roomController.js";

const router = express.Router();

router.post("/create", createRoom);
router.post("/join", joinRoom);
router.post("/:roomId/songs", addSong);
router.post("/:roomId/vote", voteSong);

export default router;

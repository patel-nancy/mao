import express from "express";
import { Room } from "../models/roomModel.js";

const router = express.Router();
const maxPlayers = 5;

//creating new room
router.post("/", async (req, res) => {
	try {
		if (!req.body.room_name || !req.body.owner) {
			return res
				.status(400)
				.send({ message: "Missing info: room name or owner" });
		}
		let newRoom;
		if (req.body.room_password) {
			//requires a password
			newRoom = {
				room_name: req.body.room_name,
				owner: req.body.owner,
				room_password: req.body.room_password,
				curr_num_players: 1,
				players: [req.body.owner],
			};
		} else {
			//"open" room
			newRoom = {
				room_name: req.body.room_name,
				owner: req.body.owner,
				curr_num_players: 1,
				players: [req.body.owner],
			};
		}
		const room = await Room.create(newRoom);
		//TODO: put owner in new room
		return res.status(200).json(room);
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

//deleting room
router.delete("/:roomid", async (req, res) => {
	try {
		const { roomid } = req.params;
		//TODO: for each player in the room, kick them out to main
		const result = await Room.findByIdAndDelete(roomid);
		if (!result) {
			return res.status(404).json({ message: "Room not found" });
		}
		return res.status(200).send({ message: "Success: room deleted" });
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

//updating the number of players in room, IF there's space
router.put("/:roomid", async (req, res) => {
	try {
		if (!req.body.newplayer) {
			return res.status(400).send({ message: "Missing new player name" });
		}
		const { roomid } = req.params;
		const room = await Room.findById(roomid);
		if (!room) {
			return res.status(404).json({ message: "Room not found." });
		}
		if (room.players.length < maxPlayers) {
			room.players.push(req.body.newplayer);
			await room.save();
			return res
				.status(200)
				.send({ message: "Successful: players in room updated." });
		}
		return res
			.status(404)
			.json({ message: "Full room. Can't add another player." });
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

export default router;

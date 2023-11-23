import express from "express";
import axios from "axios";
import { Room } from "../models/roomModel.js";

const router = express.Router();
const maxPlayers = 5;

//gets ALL rooms
router.get("/", async (req, res) => {
	try {
		const rooms = await Room.find({});
		return res.status(200).json({ count: rooms.length, data: rooms });
	} catch (err) {
		console.log(err.message);
		return res.status(500).send({ message: err.message });
	}
});

//gets room by id
router.get("/:roomid", async (req, res) => {
	try {
		const { roomid } = req.params;
		const room = await Room.findById(roomid);
		return res.status(200).json(room);
	} catch (err) {
		console.log(err.message);
		return res.status(500).send({ message: err.message });
	}
});

//creating new room
router.post("/create", async (req, res) => {
	try {
		if (!req.body.room_name || !req.body.owner) {
			return res.json({
				success: false,
				message: "Missing info: room name or owner",
			});
		}
		let newRoom;
		if (req.body.room_password) {
			//requires a password
			newRoom = {
				room_name: req.body.room_name,
				owner: req.body.owner,
				room_password: req.body.room_password,
				players: [],
			};
		} else {
			//"open" room
			newRoom = {
				room_name: req.body.room_name,
				owner: req.body.owner,
				players: [],
			};
		}
		const room = await Room.create(newRoom);
		//NOTE: owner is put in new room on CLIENT side (makes a call to a users route)

		return res.status(200).json({
			success: true,
			room_id: room._id,
			message: "Room Created",
		});
	} catch (err) {
		console.log(err.message);
		res.json({ success: false, message: err.message });
	}
});

//deleting room
router.delete("/:roomid", async (req, res) => {
	try {
		const { roomid } = req.params;
		//for each player in the room, kick them out to main
		//getting all players in room
		const room = await Room.findById(roomid);
		if (!room) {
			return res.json({ success: false, message: "Room not found" });
		}
		const players = room.players;

		//find each player by username in DB
		for (let i = 0; i < players.length; i++) {
			let username = players[i];

			axios
				.put(`http://localhost:5000/users/curr_room/${username}`)
				.then((res) => {
					if (res.data.success) {
						console.log("Player moved to main.");
					} else {
						return res.json({
							success: false,
							message: res.data.message,
						});
					}
				})
				.catch((err) => {
					res.json({ success: false, message: err.message });
				});
		}

		const result = await Room.findByIdAndDelete(roomid);
		if (!result) {
			return res.json({ success: false, message: "Room not found" });
		}
		return res
			.status(200)
			.json({ success: true, message: "Success: room deleted" });
	} catch (err) {
		console.log(err.message);
		res.json({ success: false, message: err.message });
	}
});

//adding player to room, IF there's space
router.put("/adduser/:roomid", async (req, res) => {
	try {
		if (!req.body.newplayer) {
			return res.json({
				success: false,
				message: "Missing new player name",
			});
		}
		const { roomid } = req.params;
		const room = await Room.findById(roomid);
		if (!room) {
			return res.json({ success: false, message: "Room not found." });
		}
		//NOTE: player's curr_room_id changes on CLIENT side (another put request made to users route)
		if (room.players.length < maxPlayers) {
			room.players.push(req.body.newplayer);
			await room.save();
			return res.status(200).json({
				success: true,
				message: "Successful: players in room updated.",
			});
		}
		return res.json({
			success: false,
			message: "Full room. Can't add another player.",
		});
	} catch (err) {
		console.log(err.message);
		res.json({ success: false, message: err.message });
	}
});

//deleting player from a room
router.put("/deleteuser/:roomid", async (req, res) => {
	try {
		if (!req.body.playertodelete) {
			return res.json({
				success: false,
				message: "Missing player to be deleted",
			});
		}
		const { roomid } = req.params;
		const room = await Room.findById(roomid);
		if (!room) {
			return res.json({ success: false, message: "Room not found." });
		}
		for (let i = 0; i < room.players.length; i++) {
			if (req.body.playertodelete === room.players[i]) {
				room.players.splice(i, 1); //remove the player at that index
				await room.save();
				//NOTE: user's curr_room_id must be changed on CLIENT side

				return res.status(200).json({
					success: true,
					message: "Successful: player removed from room.",
				});
			}
		}
		return res.json({
			success: false,
			message: "Could not find player in room's player list.",
		});
	} catch (err) {
		console.log(err.message);
		return res.json({ success: false, message: err.message });
	}
});

export default router;

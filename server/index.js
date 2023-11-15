import express from "express";
import { PORT, ATLAS_URL } from "./config.js";
import mongoose from "mongoose";
import { User } from "./models/userModel.js";
import { Room } from "./models/roomModel.js";
const maxPlayers = 5;

const app = express();
//starting server/client
app.get("/", (req, res) => {
	console.log(req);
	return res.status(234).send("Starting...");
});
app.use(express.json()); //for all post reqs, we need this line to parse the req body

//connecting to mongoose
mongoose
	.connect(ATLAS_URL)
	.then(() => {
		console.log("Connected to Database.");
		app.listen(PORT, () => {
			console.log(`Port: ${PORT}`);
		});
	})
	.catch((err) => {
		console.log(err);
	});

//Route: /newuser
//creating new user
app.post("/newuser", async (req, res) => {
	try {
		//required fields NOT filled in
		if (!req.body.username || !req.body.password) {
			return res.status(400).send({
				message: "Missing info: username or password",
			});
		}

		const newUser = {
			username: req.body.username,
			hashed_password: req.body.password, //TODO: hash the pass
			wins: 0,
			losses: 0,
			curr_room: "Main",
		};

		const user = await User.create(newUser); //userModel.js
		return res.status(201).send(user);
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

//Route: /getusers
//get ALL users from database
app.get("/getusers", async (req, res) => {
	try {
		const users = await User.find({});
		return res.status(200).json(users);
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

//Route: /getusers/:room
//get users in SPECIFIC room
app.get("/getusers/:room", async (req, res) => {
	try {
		//TODO: make sure room exists
		const { room } = req.params; //in the route, :room is a parameter
		const users = await User.find({ curr_room: room });
		return res.status(200).json(users);
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

//Route: /updatecurrroom/:userid
//user wants to update rooms
app.put("/updatecurrroom/:userid", async (req, res) => {
	try {
		if (!req.body.room) {
			return res.status(400).send({ message: "Missing Room" });
		}
		const { userid } = req.params;
		const result = await User.findByIdAndUpdate(userid, {
			curr_room: req.body.room,
		});
		if (!result) {
			return res
				.status(404)
				.json({ message: "User not found. Cannot update room." });
		}
		return res
			.status(200)
			.send({ message: "Successful: user room updated." });
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

//Route: /returntomain/:userid
//user "kicked" out of room -- either room closed or game ended
app.put("/returntomain/:userid", async (req, res) => {
	try {
		const { userid } = req.params;
		const result = await User.findByIdAndUpdate(userid, {
			curr_room: "Main",
		});
		if (!result) {
			return res
				.status(404)
				.json({ message: "User not found. Cannot update room." });
		}
		return res.status(200).send({ message: "Success: user room updated." });
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

//Route: /newroom
//creating new room
app.post("/newroom", async (req, res) => {
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

//Route: /room/:roomid
//deleting room
app.delete("/room/:roomid", async (req, res) => {
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

//Route: /updateroomplayers/:roomid
//updating the number of players in room, if there's space
app.put("/updateroomplayers/:roomid", async (req, res) => {
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

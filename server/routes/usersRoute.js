import express from "express";
import { User } from "../models/userModel.js";

const router = express.Router();

//creating new user
router.post("/", async (req, res) => {
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

//ALL users from database
router.get("/", async (req, res) => {
	try {
		const users = await User.find({});
		return res.status(200).json(users);
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

//TODO: rooms are currently room NAMES, not ID
//get users in SPECIFIC room
router.get("/:room", async (req, res) => {
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

//update user's curr_room
router.put("/curr_room/:userid", async (req, res) => {
	try {
		const { userid } = req.params;
		//determining which room to go to
		let next_room;
		if (!req.body.room) {
			//go to Main
			next_room = "Main";
		} else {
			next_room = req.body.room;
		}
		const result = await User.findByIdAndUpdate(userid, {
			curr_room: next_room,
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

export default router;
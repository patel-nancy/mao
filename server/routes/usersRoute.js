import express from "express";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";

const router = express.Router();
const saltRounds = 10;

//validating user login
router.post("/login", async (req, res) => {
	try {
		if (!req.body.username || !req.body.password) {
			return res.json({
				success: false,
				message: "Missing info: username or password",
			});
		}

		const user = await User.findOne({ username: req.body.username });
		if (!user) {
			return res.json({ success: false, message: "User not found" });
		}

		const isValidPassword = await bcrypt.compare(
			req.body.password,
			user.hashed_password
		);

		if (!isValidPassword) {
			return res.json({ success: false, message: "Invalid password." });
		}

		//set user's curr_room_id to Main's id whenever they log in
		await User.updateOne(
			{ _id: user._id },
			{ $set: { curr_room_id: "655e9fd84c9886c72113403d" } }
		);

		return res.status(200).json({
			success: true,
			username: req.body.username,
			message: "Login Successful",
		});
	} catch (err) {
		console.log(err.message);
		res.json({ success: false, message: err.message });
	}
});

//creating new user
router.post("/register", async (req, res) => {
	try {
		//required fields NOT filled in
		if (!req.body.username || !req.body.password) {
			return res.json({
				success: false,
				message: "Missing info: username or password",
			});
		}

		//make sure username is unique
		const isExistingUser = await User.findOne({
			username: req.body.username,
		});
		if (isExistingUser) {
			return res.json({
				success: false,
				message: "This username already exists",
			});
		}

		const hashed_password = await bcrypt.hash(
			req.body.password,
			saltRounds
		);

		const newUser = {
			username: req.body.username,
			hashed_password: hashed_password,
			wins: 0,
			losses: 0,
			curr_room_id: "655e9fd84c9886c72113403d", //Main room ID
		};

		const user = await User.create(newUser); //userModel.js
		return res.status(201).json({
			success: true,
			username: user.username,
			message: "Register Successful",
		});
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

//ALL users from database
router.get("/", async (req, res) => {
	try {
		const users = await User.find({});
		return res.status(200).json({ count: users.length, data: users });
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

//get users in SPECIFIC room
router.get("/:roomid", async (req, res) => {
	try {
		//TODO: make sure room exists
		const { roomid } = req.params; //in the route, :room is a parameter
		const users = await User.find({ curr_room_id: roomid });
		return res.status(200).json(users);
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

//update user's curr_room_id
router.put("/curr_room/:username", async (req, res) => {
	try {
		const { username } = req.params;
		//determining which room to go to
		let next_room;
		if (!req.body.room_id) {
			//go to Main
			next_room = "655e9fd84c9886c72113403d";
		} else {
			next_room = req.body.room_id;
		}
		const result = await User.updateOne(
			{ username: username },
			{ $set: { curr_room_id: next_room } }
		);
		if (!result) {
			return res.json({
				success: false,
				message: "User not found. Cannot update room.",
			});
		}
		return res
			.status(200)
			.json({ success: true, message: "Successful: user room updated." });
	} catch (err) {
		console.log(err.message);
		res.status(500).json({ success: false, message: err.message });
	}
});

export default router;

import express from "express";
import { PORT, ATLAS_URL } from "./config.js";
import mongoose from "mongoose";
import { User } from "./models/userModel.js";

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
				message: "Incomplete required fields (username or password)",
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
//get all users from database
app.get("/getusers", async (req, res) => {
	try {
		const users = await User.find({});
		return res.status(200).json(users);
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: err.message });
	}
});

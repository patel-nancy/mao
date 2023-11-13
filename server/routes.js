const express = require("express");
const User = require("./models/user"); // Adjust the path as needed

const router = express.Router();

// Route to get all users
router.get("/users", async (req, res) => {
	try {
		const users = await User.find();
		res.json(users);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Route to create a new user
router.post("/users", async (req, res) => {
	const { name, age } = req.body;

	try {
		const newUser = new User({ name, age });
		await newUser.save();
		res.status(201).json(newUser);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports = router;

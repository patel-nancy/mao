import express from "express";
import { PORT, ATLAS_URL } from "./config.js";
import mongoose from "mongoose";
import usersRoute from "./routes/usersRoute.js";
import roomsRoute from "./routes/roomsRoute.js";
import cors from "cors";

const app = express();
app.use(express.json()); //for all post reqs, we need this line to parse the req body
app.use(cors());

//starting server/client
app.get("/", (req, res) => {
	console.log(req);
	return res.status(234).send("Starting...");
});

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

//user functionality
app.use("/users", usersRoute);

//room functionality
app.use("/rooms", roomsRoute);

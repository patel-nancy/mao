import express from "express";
import { PORT, ATLAS_URL } from "./config.js";
import mongoose from "mongoose";

const app = express();
app.get("/", (req, res) => {
	console.log(req);
	return res.status(234).send("Starting...");
});

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

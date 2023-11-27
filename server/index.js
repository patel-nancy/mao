import express from "express";
import { PORT, ATLAS_URL } from "./config.js";
import mongoose from "mongoose";
import usersRoute from "./routes/usersRoute.js";
import roomsRoute from "./routes/roomsRoute.js";
import cardsRoute from "./routes/cardsRoute.js";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import sockets from "./socket/socket.js";

const app = express();
app.use(express.json()); //for all post reqs, we need this line to parse the req body
app.use(cors());

//socket
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});
io.on("connection", sockets);
export { io };

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
		//instead of app.listen, use server so we can use socket
		server.listen(PORT, () => {
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

//game functionality
app.use("/cards", cardsRoute);

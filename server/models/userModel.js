import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
	},

	//creative portion: hashed passwords
	hashed_password: {
		type: String,
		required: true,
	},

	//creative portion: player stats (wins : losses)
	wins: {
		type: Number,
	},
	losses: {
		type: Number,
	},

	curr_room_id: {
		type: ObjectId,
	},
});

export const User = mongoose.model("User", userSchema);

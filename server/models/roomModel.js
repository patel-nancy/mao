import mongoose from "mongoose";

const roomSchema = mongoose.Schema({
	room_name: {
		type: String,
		required: true,
	},

	//??? creative portion: room passwords
	room_password: {
		type: String,
	},

	players: {
		type: Array,
		required: true,
	},

	owner: {
		type: String,
		required: true,
	},

	rules: {
		type: Array,
	},
});

export const Room = mongoose.model("Room", roomSchema);

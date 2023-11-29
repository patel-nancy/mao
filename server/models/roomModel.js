import mongoose from "mongoose";

const roomSchema = mongoose.Schema({
	room_name: {
		type: String,
		required: true,
	},

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
		reverse: { type: String },
		skip: { type: String },
		curr_player_id: { type: Number },
	},

	started: {
		type: Boolean,
		required: true,
	},
});

export const Room = mongoose.model("Room", roomSchema);

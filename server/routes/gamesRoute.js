import express from "express";
import axios from "axios";
import { Room } from "../models/roomModel.js";

const router = express.Router();

router.get("/generate_rules", async (req, res) => {
	if (!req.body.room_id) {
		return res.json({ success: false, message: "No room_id given." });
	}

	//randomly picking reverse/skip cards
	const options = [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"K",
		"J",
		"Q",
		"A",
	];

	const i = Math.floor(Math.random() * options.length);
	let j = Math.floor(Math.random() * options.length);
	while (i === j) {
		j = Math.floor(Math.random() * options.length);
	}

	const reverse = options[i];
	const skip = options[j];

	const curr_reverse = Math.random() < 0.5; //sets curr_reverse to True/False randomly
	//Creative Portion: game on/off?
	//randomly generate a number of milliseconds before the game is on...if anyone plays their card before the game is on, they draw a card

	//update room rules
	axios
		.post(
			`http://localhost:5555/rules/${req.body.room_id}`,
			{
				reverse: reverse,
				curr_reverse: curr_reverse,
				skip: skip,
				curr_player_index: 0,
			},
			{ headers: { "Content-Type": "application/json" } }
		)
		.then((res) => {
			if (res.data.success) {
				return res.json({
					success: true,
					message: "room updated with rules",
				});
			} else {
				return res.json({ success: false, message: res.data.message });
			}
		})
		.catch((err) => {
			console.log(err.message);
			return res.json({ success: false, message: err.message });
		});
});

//update whose turn it is (next index), based on reverse/skip
router.put("/updateTurn", async (req, res) => {
	try {
		if (!req.body.room_id) {
			return res.json({ success: false, message: "Missing room ID" });
		}
		if (!req.body.card_code) {
			return res.json({ success: false, message: "Missing card code" });
		}

		//finding room rules
		const room = await Room.findById(req.body.room_id);
		if (!room) {
			return res.json({ success: false, message: "Room not found" });
		}
		if (!room.rules) {
			return res.json({ success: false, message: "No rules found" });
		}
		const reverse = room.rules.reverse;
		let curr_reverse = room.rules.curr_reverse;
		const skip = room.rules.skip;
		const curr_player_index = room.rules.curr_player_index;
		console.log(reverse, curr_reverse, skip, curr_player_index);

		const player_length = room.players.length;

		//determine if card code contains a reverse/skip/normal (following current state of reverse)
		let new_player_index;
		if (req.body.card_code.includes(reverse)) {
			curr_reverse = !curr_reverse;
			console.log(curr_reverse);
		}
		if (curr_reverse) {
			//move backward through array by X steps
			let step = 1;
			if (req.body.card_code.includes(skip)) {
				step = 2;
			}
			new_player_index =
				(curr_player_index - step + player_length) % player_length;
		} else {
			//move forward through array by X steps
			let step = 1;
			if (req.body.card_code.includes(skip)) {
				step = 2;
			}
			new_player_index = (curr_player_index + step) % player_length;
		}
		console.log(new_player_index);

		const result = await Room.findByIdAndUpdate(req.body.room_id, {
			rules: {
				reverse: reverse,
				curr_reverse: curr_reverse,
				skip: skip,
				curr_player_index: new_player_index,
			},
		});
		if (!result) {
			return res.json({
				success: false,
				message: "Could not update room's curr_player_index",
			});
		}
		return res.json({ success: true });
	} catch (err) {
		console.log(err.message);
		return res.json({ success: false, message: err.message });
	}
});

//is it your turn?
//RETURNS true/false
router.post("/isMyTurn", async (req, res) => {
	try {
		if (!req.body.deck_id) {
			return res.json({ success: false, message: "No deck_id" });
		}
		if (!req.body.username) {
			return res.json({ success: false, message: "No username" });
		}
		if (!req.body.room_id) {
			return res.json({ success: false, message: "No room_id" });
		}

		//get the curr_player_index from room.rules
		const room = await Room.findById(req.body.room_id);
		if (!room) {
			return res.json({ success: false, message: "Room not found" });
		}
		const curr_player_index = room.rules.curr_player_index;

		if (room.players[curr_player_index] === req.body.username) {
			return res.json({ success: true, isMyTurn: true });
		} else {
			return res.json({ success: true, isMyTurn: false });
		}
	} catch (err) {
		console.log(err.message);
		return res.json({ success: false, message: err.message });
	}
});

export default router;

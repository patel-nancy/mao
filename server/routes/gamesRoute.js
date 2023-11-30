import express from "express";
import axios from "axios";
import { Room } from "../models/roomModel.js";

const router = express.Router();

router.post("/generate_rules", async (req, res) => {
	console.log(req.body);
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
			`http://localhost:5555/rooms/rules/${req.body.room_id}`,
			{
				reverse: reverse,
				curr_reverse: curr_reverse,
				skip: skip,
				curr_player_index: 0,
			},
			{ headers: { "Content-Type": "application/json" } }
		)
		.then((response) => {
			if (response.data.success) {
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
router.post("/updateTurn", async (req, res) => {
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
		console.log(curr_player_index);

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

router.post("/playTurn", async (req, res) => {
	try {
		if (!req.body.card_code) {
			return res.json({ success: false, message: "No card_code" });
		}
		if (!req.body.deck_id) {
			return res.json({ success: false, message: "No deck_id" });
		}
		if (!req.body.username) {
			return res.json({ success: false, message: "No username" });
		}
		if (!req.body.room_id) {
			return res.json({ success: false, message: "No room_id" });
		}

		//is it your turn?
		let canPlay;
		const isMyTurn = await axios.post(
			"http://localhost:5555/games/isMyTurn",
			{
				deck_id: req.body.deck_id,
				username: req.body.username,
				room_id: req.body.room_id,
			},
			{ headers: { "Content-Type": "application/json" } }
		);
		console.log(isMyTurn.data);
		if (!isMyTurn.data.success) {
			return res.json({ success: false, message: isMyTurn.data.message });
		}
		canPlay = isMyTurn.data.isMyTurn;

		//wrong turn...draw card
		if (!canPlay) {
			const result = await axios.post(
				"http://localhost:5555/cards/sendcards",
				{ deck_id: req.body.deck_id, playertosend: req.body.username },
				{ headers: { "Content-Type": "application/json" } }
			);
			if (!result) {
				return res.json({
					success: false,
					message: "Could not send drawn card to player pile",
				});
			} else if (!result.data.success) {
				return res.json({
					success: false,
					message: result.data.message,
				});
			}

			return res.json({
				success: true,
				isPlayedChanged: false,
				message: "Played out of turn. Player draws extra card.",
			});
		}

		//grab top played card
		const played_cards = await axios.post(
			"http://localhost:5555/cards/whosecards",
			{ deck_id: req.body.deck_id, username: "played" },
			{ headers: { "Content-Type": "application/json" } }
		);
		if (!played_cards) {
			return res.json({
				success: false,
				message: "Could not grab top played card",
			});
		}
		if (!played_cards.data.success) {
			return res.json({
				success: false,
				message: played_cards.data.message,
			});
		}
		const top_card = played_cards.data.top_card;
		console.log(top_card);

		//compare your card to top card
		for (let i = 0; i < req.body.card_code.length; i++) {
			if (req.body.card_code[i] === top_card.code[i]) {
				//VALID card play
				//move card to played pile
				const result = await axios.post(
					"http://localhost:5555/cards/sendcards",
					{
						card_played_code: req.body.card_code,
						deck_id: req.body.deck_id,
					},
					{ headers: { "Content-Type": "application/json" } }
				);
				if (!result) {
					return res.json({
						success: false,
						message: "Unable to move played card to played pile",
					});
				} else if (!result.data.success) {
					return res.json({
						success: false,
						message: result.data.message,
					});
				}

				//update next player index
				const update_result = await axios.post(
					"http://localhost:5555/games/updateTurn",
					{
						room_id: req.body.room_id,
						card_code: req.body.card_code,
					},
					{ headers: { "Context-Type": "application/json" } }
				);
				if (!update_result) {
					return res.json({
						success: false,
						message: "Unable to update next player index",
					});
				} else if (!update_result.data.success) {
					return res.json({
						success: false,
						message: update_result.data.message,
					});
				}

				return res.json({
					success: true,
					isPlayedChanged: true, //if true, update played. else update your cards
					message: "Card played",
				});
			}
		}

		//invalid card play
		//draw card
		const draw_result = await axios.post(
			"http://localhost:5555/cards/sendcards",
			{ deck_id: req.body.deck_id, playertosend: req.body.username },
			{ headers: { "Content-Type": "application/json" } }
		);
		if (!draw_result) {
			return res.json({
				success: false,
				message: "Could not send drawn card to player pile",
			});
		} else if (!draw_result.data.success) {
			return res.json({
				success: false,
				message: draw_result.data.message,
			});
		}

		//update next player index
		const update_result = await axios.post(
			"http://localhost:5555/games/updateTurn",
			{
				room_id: req.body.room_id,
				card_code: "LL", //fake card_code, so no reverse/skip/curr_reverse changes, just index
			},
			{ headers: { "Context-Type": "application/json" } }
		);
		if (!update_result) {
			return res.json({
				success: false,
				message: "Unable to update next player index",
			});
		} else if (!update_result.data.success) {
			return res.json({
				success: false,
				message: update_result.data.message,
			});
		}
		return res.json({
			success: true,
			isPlayedChaged: false,
			message: "Invalid play. Card drawn. Moving onto next player",
		});
	} catch (err) {
		console.log(err.message);
		return res.json({ success: false, message: err.message });
	}
});

export default router;

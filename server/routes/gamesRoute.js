import express from "express";
import axios from "axios";

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

	//update room rules
	axios
		.post(
			`http://localhost:5555/rules/${req.body.room_id}`,
			{ reverse: reverse, skip: skip },
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

//TODO: update whose turn it is

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

		//TODO: finish
	} catch (err) {
		console.log(err.message);
		return res.json({ success: false, message: err.message });
	}
});

export default router;

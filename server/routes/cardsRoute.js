import express from "express";
import axios from "axios";

const router = express.Router();
const deck_count = 1;

//TODO: sockets

//generate new (shuffled) deck for room
//NOTE: we only use one deck but reshuffle once the draw pile gets low
router.get("/newdeck", async (req, res) => {
	try {
		const result = await axios.get(
			`https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${deck_count}`
		);
		if (!result) {
			return res.json({ success: false, message: "API call failed." });
		}
		return res.json({
			success: true,
			deck_id: result.data.deck_id,
		});
	} catch (err) {
		console.log(err);
		return res.json({ success: false, message: err });
	}
});

//get cards from deck
//PARAMS: deck ID, draw_count (optional)
router.post("/draw", async (req, res) => {
	try {
		if (!req.body.deck_id) {
			return res.json({ success: false, message: "Missing deck ID" });
		}
		const deck_id = req.body.deck_id;

		//how many cards drawn (DEFAULT: 1)
		let draw_count;
		if (req.body.draw_count) {
			draw_count = req.body.draw_count;
		} else {
			draw_count = 1;
		}

		//API call
		const result = await axios.get(
			`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${draw_count}`
		);
		if (!result) {
			return res.json({ success: false, message: "API call failed" });
		}

		//NOTE: accesing cards
		//console.log(result.data.cards[1].code);

		return res.json({
			success: true,
			remaining: result.data.remaining,
			cards: result.data.cards,
		});
	} catch (err) {
		console.log(err.message);
		return res.json({ success: false, message: err.message });
	}
});

//sending cards to piles (each player hand or discard)
//could be used for: initial hands, drawing cards, playing cards
router.post("/sendcards", async (req, res) => {
	try {
		if (!req.body.deck_id) {
			return res.json({ success: false, message: "Missing deck_id" });
		}
		const deck_id = req.body.deck_id;

		//what pile cards will be going to
		let pile_name;
		if (!req.body.playertosend) {
			pile_name = "played";
		} else {
			pile_name = req.body.playertosend;
		}

		//how many cards drawn
		let draw_count;
		if (req.body.draw_count) {
			draw_count = req.body.draw_count;
		} else {
			draw_count = 1;
		}

		//getting cards
		const result = await axios.post(
			"http://localhost:5555/cards/draw",
			{
				deck_id: deck_id,
				draw_count: draw_count,
			},
			{ headers: { "Content-Type": "application/json" } }
		);
		if (!result) {
			return res.json({
				success: false,
				message: "Get cards call failed",
			});
		}
		const cards = result.data.cards;

		//send cards to pile
		for (let i = 0; i < cards.length; i++) {
			const pile_result = await axios.get(
				`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile_name}/add/?cards=${cards[i].code}`
			);
			if (!pile_result) {
				return res.json({
					success: false,
					message: "Could not add a card to corresponding pile",
				});
			}
		}

		//DOUBLE-CHECKING: listing cards in piles
		const list_pile = await axios.get(
			`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile_name}/list/`
		);
		console.log(list_pile.data.piles);

		return res.json({
			success: true,
			message: "Cards sent to correct piles",
		});
	} catch (err) {
		console.log(err.message);
		return res.json({ success: false, message: err.message });
	}
});

//starts game
//creates deck + distributes cards to players
//(each pile is diff player)
router.post("/startgame", async (req, res) => {
	try {
		if (!req.body.room_id) {
			return res.json({ success: false, message: "Missing room ID." });
		}
		const room_id = req.body.room_id;

		//creating new deck
		const newdeck = await axios.get("http://localhost:5555/cards/newdeck");
		const deck_id = newdeck.data.deck_id;

		//get player list from room
		const room = await axios.get(`http://localhost:5555/rooms/${room_id}`);
		if (!room) {
			return res.json({ success: false, message: "Could not find room" });
		}
		const players = room.data.players;

		//go through each player, give them 7 cards
		const draw_count = 7;
		for (let i = 0; i < players.length; i++) {
			const result = await axios.post(
				"http://localhost:5555/cards/sendcards",
				{
					deck_id: deck_id,
					playertosend: players[i],
					draw_count: draw_count,
				},
				{ headers: { "Content-Type": "application/json" } }
			);
			if (!result) {
				return res.json({
					success: false,
					message: `Could not get cards to ${players[i]}`,
				});
			}
		}

		return res.json({
			success: true,
			deck_id: deck_id,
			message: "Cards added to user's piles",
		});
	} catch (err) {
		console.log(err.message);
		return res.json({ success: false, message: err.message });
	}
});

//get specific card pile
router.post("/whosecards", async (req, res) => {
	try {
		if (!req.body.deck_id) {
			return res.json({
				success: false,
				message: "Missing deck_id ",
			});
		}
		if (!req.body.username) {
			return res.json({
				success: false,
				message: "Missing username",
			});
		}
		const deck_id = req.body.deck_id;
		const pile_name = req.body.username;

		const list_pile = await axios.get(
			`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile_name}/list/`
		);
		if (!list_pile) {
			return res.json({
				success: false,
				message: "Could not find that pile",
			});
		}
		return res.json({
			success: true,
			list_pile: list_pile.data.piles,
			remaining: list_pile.data.piles[pile_name].remaining,
			cards: list_pile.data.piles[pile_name].cards,
		});
	} catch (err) {
		console.log(err.message);
		console.log(req.body.deck_id);
		console.log(req.body.username);
		return res.json({ success: false, message: err.message });
	}
});

export default router;

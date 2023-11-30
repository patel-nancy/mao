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

//refill draw "pile" (actually just the deck) because it has no cards left
//so, take all (except the top) cards from "played" pile and send to deck
router.post("/refillDraw", async (req, res) => {
	try {
		if (!req.body.deck_id) {
			return res.json({ success: false, message: "Missing deck_id" });
		}
		const deck_id = req.body.deck_id;

		//hold onto top card of "played" pile
		const top_card_result = await axios.get(
			`https://www.deckofcardsapi.com/api/deck/${deck_id}/pile/played/draw/`
		);
		if (!top_card_result) {
			return res.json({
				success: false,
				message: "Failed to draw top card from played pile",
			});
		}
		const top_card = top_card_result.data.cards[0]; //CHECK: dk if this is supposed to 0 or 1
		console.log(top_card);

		//send rest of cards in "played" pile back to deck
		const back_to_deck = await axios.get(
			`https://www.deckofcardsapi.com/api/deck/${deck_id}/pile/played/return/`
		);
		if (!back_to_deck || !back_to_deck.data.success) {
			return res.json({
				success: false,
				message: "Unable to send rest of played cards back to deck",
			});
		}

		//TODO: reshuffle deck
		console.log("Reshuffling");
		const shuffled = await axios.get(
			`https://www.deckofcardsapi.com/api/deck/${deck_id}/shuffle/?remaining=true`
		);
		if (!shuffled || !shuffled.data.success) {
			return res.json({
				success: false,
				message: "Unable to shuffle deck",
			});
		}

		//add top card back into "played" pile
		const add_top_back = await axios.get(
			`https://www.deckofcardsapi.com/api/deck/${deck_id}/pile/played/add/?cards=${top_card.code}`
		);
		if (!add_top_back) {
			return res.json({
				success: false,
				message: "Can't to put top card back in played pile.",
			});
		}
	} catch (err) {
		console.log(err.message);
		return res.json({ success: false, message: err.message });
	}
});

//get + DRAW cards from deck
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
			return res.json({
				success: false,
				message: "Failed API call",
			});
		}

		//draw "pile" REMAINING = 0
		if (!result.data.success) {
			//refilling draw deck
			console.log("Refilling draw deck");

			const refill_result = await axios.post(
				"http://localhost:5555/cards/refillDraw",
				{ deck_id: deck_id },
				{ headers: { "Content-Type": "application/json" } }
			);
			if (!refill_result) {
				return res.json({
					success: false,
					message: "Could not refill draw deck.",
				});
			} else if (!refill_result.data.success) {
				return res.json({
					success: false,
					message: refill_result.data.message,
				});
			}

			//drawing again
			//API call
			const result2 = await axios.get(
				`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${draw_count}`
			);
			if (!result2) {
				return res.json({
					success: false,
					message: "Failed API call",
				});
			}
			return res.json({
				success: true,
				remaining: result2.data.remaining,
				cards: result2.data.cards,
			});
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

//sending cards to piles (each player hand or "played" pile)
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

		let cards;
		if (!req.body.card_played_code) {
			//getting cards from DRAW + DECK
			//could be used for: initial hands, drawing cards

			//how many cards drawn
			let draw_count;
			if (req.body.draw_count) {
				draw_count = req.body.draw_count;
			} else {
				draw_count = 1;
			}

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
			cards = result.data.cards;
		} else {
			//a card was played. send this SPECIFIC card code to played pile
			cards = req.body.card_played_code;
		}

		//send cards to pile
		for (let i = 0; i < cards.length; i++) {
			let pile_result;
			if (typeof cards === "string") {
				//we have the card code (this card was played)
				//trust the process on this one. IDK how it knows to transfer it from pile to pile, it just does
				pile_result = await axios.get(
					`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile_name}/add/?cards=${cards}`
				);
			} else {
				//we have an array of cards (these cards are from the deck)
				pile_result = await axios.get(
					`https://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile_name}/add/?cards=${cards[i].code}`
				);
			}

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
		console.log(list_pile.data);
		//console.log(list_pile.data.success);

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

		//add a card to "played" pile
		const result = await axios.post(
			"http://localhost:5555/cards/sendcards",
			{ deck_id: deck_id },
			{ headers: { "Content-Type": "application/json" } }
		);
		if (!result) {
			return res.json({
				success: false,
				message: "Could not add a card to `played` pile",
			});
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
//can also be used to get played pile! username = "played"
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
			list_pile: list_pile.data.piles, //gets remaining of other cards
			remaining: list_pile.data.piles[pile_name].remaining,
			cards: list_pile.data.piles[pile_name].cards, //your cards
			top_card:
				list_pile.data.piles[pile_name].cards[
					list_pile.data.piles[pile_name].cards.length - 1 //the most recent card is the last element in the pile
				],
		});
	} catch (err) {
		console.log(err.message);
		console.log(req.body.deck_id);
		console.log(req.body.username);
		return res.json({ success: false, message: err.message });
	}
});

export default router;

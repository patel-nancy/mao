import React, { useEffect, useState } from "react";
//import { useAuth } from "../AuthContext";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import BackBtn from "../components/BackBtn";
import Spinner from "../components/Spinner";
import { socket } from "../socket";

//TODO: get rid of user from player's list if they close off the tab...ie, don't actually press the back btn
//TODO: start game when someone clicks btn...then don't let people in
//NOTE: "list all users in room" will happen during gameplay where you can see the person you're competing against

//TODO: implement passwords
//TODO: set Start based on room.started

const enterRoom = () => {
	const navigate = useNavigate();
	// const { user } = useAuth();
	const user = localStorage.getItem("username");
	//session user
	if (!user) {
		navigate("/");
	}

	const [room, setRoom] = useState({});
	const { id } = useParams(); //from the APP route parameters: /rooms/enter/:id (NOTE: it has to be the same variable name as what's used in the Route)

	const [starting, setStarting] = useState(false);
	const [cards, setCards] = useState([]);
	const [otherCards, setOtherCards] = useState({});
	const [deck_id, setDeckId] = useState();

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		//update room's players list (CHECKS: password, room.started)
		axios
			.put(
				`http://localhost:5555/rooms/adduser/${id}`,
				{ newplayer: user },
				{ headers: { "Content-Type": "application/json" } }
			)
			.then((res) => {
				if (res.data.success) {
					//update player's curr_room_id to entered room
					axios
						.put(
							`http://localhost:5555/users/curr_room/${user}`,
							{ room_id: id },
							{ headers: { "Content-Type": "application/json" } }
						)
						.then((res2) => {
							if (res2.data.success) {
								console.log(
									"Success. Room's player list and user's curr_room_id updated."
								);

								//socket join room
								socket.emit("join-room", { room_id: id });

								//send to all other players new player list
								socket.emit("update-player-list", {
									room_id: id,
								});

								fetchRoomByID();
							} else {
								console.log(res2.data.message);
							}
						})
						.catch((err2) => {
							console.log(
								"An internal server error occured. Could not update player's curr_room_id"
							);
						});
				} else {
					//could not add player to room
					console.log(res.data.message);
					navigate("/home");
				}
			})
			.catch((err) => {
				console.log(
					"An internal server error occured. Could not update room's player list"
				);
			});

		//updating player list
		socket.on("updating-player-list", () => {
			fetchRoomByID();
		});

		//updating to show your cards
		socket.on("updating-cards", ({ deck_id }) => {
			console.log("From updating-cards socket", deck_id);
			yourCards(deck_id);
		});
	}, []);

	const fetchRoomByID = async () => {
		//getting room again
		try {
			axios
				.get(`http://localhost:5555/rooms/${id}`)
				.then((res) => {
					setRoom(res.data);
				})
				.catch((err) => {
					console.log(err);
					// setLoading(false);
				});
		} catch (err) {
			console.error("Error fetching room: ", err.message);
		}
	};

	const handleStarting = async (req) => {
		//useState makes this render super slowly (to the point where starting is not registered as = req), so I made it a variable
		setStarting(req);
		console.log("Req", req, "starting", starting);

		axios
			.post(
				`http://localhost:5555/rooms/started/${id}`,
				{ shouldstart: req },
				{ headers: { "Content-Type": "application/json" } }
			)
			.then((res) => {
				if (res.data.success && req) {
					console.log("Game starting...");
					createGame();
				} else if (res.data.success && !req) {
					console.log("Game stopping...");
					setCards([]);
					setOtherCards([]);
					setDeckId();
				} else {
					console.log(res.data.message);
				}
			})
			.catch((err) => {
				console.log(err.message);
			});
	};

	const createGame = async () => {
		axios
			.post(
				"http://localhost:5555/cards/startgame",
				{ room_id: id },
				{ headers: { "Content-Type": "application/json" } }
			)
			.then((res) => {
				if (res.data.success) {
					setDeckId(res.data.deck_id);

					console.log("Sent socket to update/show cards");
					socket.emit("update-cards", {
						room_id: id,
						deck_id: res.data.deck_id,
					});

					//creating rules for the game
					//should only do something if X goes wrong
					axios
						.get(
							"http://localhost:5555/games/generate_rules",
							{ room_id: id },
							{ headers: { "Content-Type": "application/json" } }
						)
						.then((res2) => {
							if (!res2.data.success) {
								console.log(res.data.message);
							}
						})
						.catch((err) => {
							console.log(err.message);
						});
				} else {
					console.log(res.data.message);
				}
			})
			.catch((err) => console.log(err.message));
	};

	const yourCards = async (req_deck_id) => {
		console.log("From yourCards: ", req_deck_id);

		axios
			.post(
				"http://localhost:5555/cards/whosecards",
				{ deck_id: req_deck_id, username: user },
				{ headers: { "Content-Type": "application/json" } }
			)
			.then((res) => {
				if (res.data.success) {
					console.log("Getting your cards...");
					setCards(res.data.cards);

					//go through each of the other players in res.data.list_pile
					//get how many cards they have backwards
					for (let player in res.data.list_pile) {
						if (player !== user) {
							//TODO: get this setter to work
							// setOtherCards([
							// 	...otherCards,
							// 	res.data.list_pile[player].remaining,
							// ]);
						}
					}
				} else {
					console.log(res.data.message);
				}
			})
			.catch((err) => {
				console.log("An internal server error occured.");
			});
	};

	const handlePlay = async (card_code) => {
		//console.log(card_code);
		console.log("From handlePlay: ", card_code);
		// isTurn = await axios.post(
		// 	"http://localhost:5555/games/isMyTurn",
		// 	{ deck_id: deck_id, username: user },
		// 	{ headers: { "Content-Type": "application/json" } }
		// );
	};

	return (
		<div className="p-4">
			<BackBtn />
			<h1 className="text-3xl my-4">Enter Room</h1>
			{loading ? (
				<Spinner />
			) : (
				<div className="flex flex-col border-2 border-sky-400 rounded-xl w-fit p-4">
					<div className="my-4">
						<span className="text-xl mr-4 text-gray-500">Id</span>
						<span>{room._id}</span>
					</div>
					<div className="my-4">
						<span className="text-xl mr-4 text-gray-500">
							Owner
						</span>
						<span>{room.owner}</span>
					</div>
					<div className="my-4">
						<span className="text-xl mr-4 text-gray-500">
							Players
						</span>
						<span>{room.players}</span>
					</div>
				</div>
			)}
			{starting ? (
				<div>
					<button
						onClick={() => handleStarting(false)}
						className="text-3xl my-4"
					>
						Stop
					</button>
					<div className="flex flex-row w-20">
						{cards.map((card) => (
							<img
								src={card.image}
								alt=""
								key={card.code}
								onClick={() => handlePlay(card.code)}
								className="cursor-pointer"
							/>
						))}
					</div>
					{/* {otherCards.map((count, index1) => (
						<div key={index1} className="flex flex-row w-20">
							{Array.from({ length: count }).map((_, index2) => (
								<img
									key={index2}
									src="https://www.deckofcardsapi.com/static/img/back.png"
								/>
							))}
						</div>
					))} */}
				</div>
			) : (
				<button
					onClick={() => handleStarting(true)}
					className="text-3xl my-4"
				>
					Start Game
				</button>
			)}
		</div>
	);
};

export default enterRoom;

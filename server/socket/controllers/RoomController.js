import BaseController from "./BaseController.js";
import { io } from "../../index.js";
import axios from "axios";

export default class RoomController extends BaseController {
	// joinRoom = ({ roomId }) => {
	// 	this.socket.join(roomId);
	// };
	logged_in = () => {
		console.log("logged in mf");
		this.socket.join("655e9fd84c9886c72113403d"); //join Main room
		console.log(this.socket.adapter.rooms); // shows which socket IDs are in which room
	};

	rooms_updated = () => {
		io.to("655e9fd84c9886c72113403d").emit("update-main-room-list");
	};

	join_room = ({ room_id }) => {
		// console.log(room_id);
		this.socket.join(room_id);
		console.log("socket has joined room");
	};

	back_to_home = ({ prev_room_id }) => {
		this.socket.join("655e9fd84c9886c72113403d");
		console.log(
			"User socket has gone back to home with prev room id: " +
				prev_room_id
		);
		this.update_player_list({ room_id: prev_room_id });
	};

	update_player_list = ({ room_id }) => {
		io.to(room_id).emit("updating-player-list");
		console.log("updating player list");
	};

	update_cards = ({ room_id, deck_id }) => {
		io.to(room_id).emit("updating-cards", { deck_id: deck_id });
		console.log(deck_id);
	};

	delete_user_on_disconnect = ({ user, room_id }) => {
		console.log("deleting " + user + " in " + room_id + " on disconnect");
		axios
			.put(
				`http://localhost:5555/rooms/deleteuser/${room_id}`,
				{ playertodelete: user },
				{ headers: { "Content-Type": "application/json" } }
			)
			.then((res) => {
				if (res.data.success) {
					console.log("successfully deleted user on unload");
					io.to(room_id).emit("updating-player-list");
				}
			})
			.catch((err) => {
				console.err(err.message);
			});
	};
}

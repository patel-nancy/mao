import BaseController from "./BaseController.js";
import { io } from "../../index.js";
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

	update_player_list = ({ room_id }) => {
		io.to(room_id).emit("updating-player-list");
		console.log("updating...");
	};
}

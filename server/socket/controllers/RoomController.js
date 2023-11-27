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

	room_created = () => {
		io.to("655e9fd84c9886c72113403d").emit("update-main-room-list");
	};

	room_deleted = () => {
		io.to("655e9fd84c9886c72113403d").emit("update-main-room-list");
	};
}

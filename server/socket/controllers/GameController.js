import BaseController from "./BaseController.js";
import { io } from "../../index.js";
export default class GameController extends BaseController {
	game_starting = ({ room_id }) => {
		io.to(room_id).emit("game_starting");
		console.log("game starting emitted");
	};

	game_stopping = ({ room_id }) => {
		io.to(room_id).emit("game_stopping");
		console.log("game stopping emitted");
	};
}

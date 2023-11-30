import RoomController from "./controllers/RoomController.js";
import GameController from "./controllers/GameController.js";

const sockets = (socket) => {
	const roomController = new RoomController(socket);
	const gameController = new GameController(socket);

	socket.on("logged-in", roomController.logged_in);

	//NOTE: if the server refreshes and the user is already on the home page, they won't get instanteous updates because the home page wasn't re-rendered
	socket.on("rooms-updated", roomController.rooms_updated);

	socket.on("join-room", roomController.join_room);
	socket.on("back_to_home", roomController.back_to_home);

	socket.on("update-player-list", roomController.update_player_list);
	socket.on("update-cards", roomController.update_cards);

	socket.on("game_starting", gameController.game_starting);
	socket.on("game_stopping", gameController.game_stopping);
	socket.on("game_over", gameController.game_over);

	socket.on("disconnect", () => {
		console.log("User disconnected");
	});
};

export default sockets;

import RoomController from "./controllers/RoomController.js";

const sockets = (socket) => {
	const roomController = new RoomController(socket);

	socket.on("logged-in", roomController.logged_in);

	//NOTE: if the server refreshes and the user is already on the home page, they won't get instanteous updates because the home page wasn't re-rendered
	socket.on("rooms-updated", roomController.rooms_updated);

	socket.on("join-room", roomController.join_room);

	socket.on("update-player-list", roomController.update_player_list);

	socket.on("disconnect", () => {
		console.log("User disconnected");
	});
};

export default sockets;

import RoomController from "./controllers/RoomController.js";

const sockets = (socket) => {
	const roomController = new RoomController(socket);

	socket.on("logged-in", roomController.logged_in);

	socket.on("disconnect", () => {
		console.log("User disconnected");
	});
};

export default sockets;

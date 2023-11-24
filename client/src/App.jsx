import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import Home from "./pages/home";
import CreateRoom from "./pages/createRoom";
import EnterRoom from "./pages/enterRoom";
import DeleteRoom from "./pages/deleteRoom";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const App = () => {
	useEffect(() => {
		socket.on("reload", () => {
			//TODO: we can't reload the whole window or else it disconnects the user from the socket
			//have to go back and redo all the routes to emit specific messages and reload specific components
			window.location.reload();
		});
	}, []);

	return (
		<Routes>
			<Route path="/" element={<Landing />} />
			<Route path="/home" element={<Home />} />
			<Route path="/rooms/create" element={<CreateRoom />} />
			<Route path="/rooms/enter/:id" element={<EnterRoom />} />
			<Route path="/rooms/delete/:id" element={<DeleteRoom />} />
		</Routes>
	);
};

export default App;

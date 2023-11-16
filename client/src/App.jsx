import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import CreateUser from "./pages/createUser";
import CreateRoom from "./pages/createRoom";
import ShowRooms from "./pages/showRooms";
import EditRoom from "./pages/editRoom";
import DeleteRoom from "./pages/deleteRoom";

const App = () => {
	return (
		<Routes>
			<Route path="/" element={Home} />
			<Route path="/users/create" element={CreateUser} />
			<Route path="/rooms/create" element={CreateRoom} />
			<Route path="/rooms/edit/:id" element={EditRoom} />
			<Route path="/rooms/delete/:id" element={DeleteRoom} />
		</Routes>
	);
};

export default App;

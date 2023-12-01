import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Landing from "./pages/landing";
import Home from "./pages/home";
import CreateRoom from "./pages/createRoom";
import EnterRoom from "./pages/enterRoom";
import DeleteRoom from "./pages/deleteRoom";
import UserProfile from "./pages/userProfile";
// import test from "./pages/test"
const App = () => {
	return (
		<Routes>
			<Route path="/" element={<Landing />} />
			<Route path="/home" element={<Home />} />
			<Route path="/rooms/create" element={<CreateRoom />} />
			<Route path="/rooms/enter/:id" element={<EnterRoom />} />
			<Route path="/rooms/delete/:id" element={<DeleteRoom />} />
			<Route path="/userprofile" element={<UserProfile />} />
		</Routes>
	);
};

export default App;

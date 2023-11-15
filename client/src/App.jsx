import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import CreateUser from "./pages/createUser";
import ShowUsers from "./pages/showUsers";

const App = () => {
	return (
		<Routes>
			<Route path="/" element={Home} />
			<Route path="/users/create" element={CreateUser} />
			<Route path="/users/details/:id" element={ShowUsers} />
		</Routes>
	);
};

export default App;

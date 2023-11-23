import React from "react";
// import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

//part of the following is from this tutorial: https://xerosource.com/how-to-manage-login-session-in-react-js/
const Logout = () => {
	const navigate = useNavigate();
	// const { logout } = useAuth();

	const handleLogout = () => {
		// logout();
		localStorage.removeItem("username");
		navigate("/");
		console.log("Logout Success.");
	};

	return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;

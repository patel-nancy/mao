import React from "react";
import { useAuth } from "../AuthContext";

//part of the following is from this tutorial: https://xerosource.com/how-to-manage-login-session-in-react-js/
const Logout = (props) => {
	const { logout } = useAuth();

	const handleLogout = () => {
		logout();
		console.log("Logout Success.");
	};

	return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;

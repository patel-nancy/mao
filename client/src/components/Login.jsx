import React, { useState } from "react";
//import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";

const Login = (props) => {
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState("");

	// const { login } = useAuth();
	// const { user } = useAuth();
	let user;

	const handleSubmit = (e) => {
		e.preventDefault(); //prevents page from reloading and changing states

		axios
			.post(
				"http://localhost:5555/users/login",
				{ username: username, password: password }, //POST params
				{
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				}
			)
			.then((res) => {
				if (res.data.success) {
					console.log("Login Success.");
					localStorage.setItem("username", res.data.username); //session
					socket.emit("logged-in"); //tesing
					setLoginError(false);
					navigate("/home");
				} else {
					//login failed for X reason
					setLoginError(res.data.message);
				}
			})
			.catch((err) => {
				setLoginError(
					"An internal server error occured. Try again later."
				);
			});
	};

	return (
		<div className="flex flex-col">
			<h1>Welcome, {user ? user : "Guest"}!</h1>
			<h1>Login</h1>
			<form className="flex flex-col" onSubmit={handleSubmit}>
				<label htmlFor="username">Username</label>
				<input
					className="border"
					value={username}
					autoComplete="username"
					type="username"
					placeholder="yourusername"
					id="username"
					name="username"
					onChange={(e) => setUsername(e.target.value)}
				/>
				<label htmlFor="password">Password</label>
				<input
					className="border"
					value={password}
					autoComplete="current-password"
					type="password"
					placeholder="*********"
					id="password"
					name="password"
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type="submit">Login</button>
			</form>
			<button onClick={() => props.onFormToggle("Register")}>
				Don't have an account? Register here.
			</button>
			{loginError && <div>{loginError}</div>}
		</div>
	);
};

export default Login;

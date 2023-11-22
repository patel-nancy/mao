import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = (props) => {
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState("");

	const { login } = useAuth();
	const { user } = useAuth();

	const handleSubmit = (e) => {
		e.preventDefault(); //prevents page from reloading and changing states
		axios
			.post(
				"http://localhost:5000/users/register",
				{ username: username, password: password },
				{ headers: { "Content-Type": "application/json" } }
			)
			.then((res) => {
				if (res.data.success) {
					console.log("Register Success.");
					login(res.data.username);
					setLoginError(false);
					navigate("/home");
				} else {
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
			<h1>Register</h1>
			<form className="flex flex-col" onSubmit={handleSubmit}>
				<label htmlFor="username">New Username</label>
				<input
					className="border"
					type="username"
					placeholder="yourusername"
					value={username}
					autoComplete="new-username"
					id="username"
					name="username"
					onChange={(e) => setUsername(e.target.value)}
				/>
				<label htmlFor="password">New Password</label>
				<input
					className="border"
					type="password"
					placeholder="*********"
					value={password}
					autoComplete="new-password"
					id="password"
					name="password"
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type="submit">Register</button>
			</form>
			<button onClick={() => props.onFormToggle("Login")}>
				Already have an account? Log in here.
			</button>
			{loginError && <div>{loginError}</div>}
		</div>
	);
};

export default Register;

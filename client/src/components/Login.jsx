import React, { useState } from "react";

const Login = (props) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault(); //prevents page from reloading and changing states
		console.log(username + password);
	};

	return (
		<div className="flex flex-col">
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
		</div>
	);
};

export default Login;

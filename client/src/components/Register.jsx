import React, { useState } from "react";

const Register = (props) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault(); //prevents page from reloading and changing states
		console.log(username + password);
	};

	return (
		<div className="flex flex-col">
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
		</div>
	);
};

export default Register;

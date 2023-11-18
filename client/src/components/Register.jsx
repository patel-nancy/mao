import React, { useState } from "react";

const Register = (props) => {
	const [new_username, setUsername] = useState("");
	const [new_password, setPassword] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault(); //prevents page from reloading and changing states
		console.log(new_username + new_password);
	};

	return (
		<div className="flex flex-col">
			<form className="flex flex-col" onSubmit={handleSubmit}>
				<label htmlFor="new_username">New Username</label>
				<input
					className="border"
					value={new_username}
					autoComplete="new-username"
					type="username"
					placeholder="yourusername"
					id="new_username"
					name="new_username"
					onChange={(e) => setUsername(e.target.value)}
				/>
				<label htmlFor="new_password">New Password</label>
				<input
					className="border"
					value={new_password}
					autoComplete="new-password"
					type="password"
					placeholder="*********"
					id="new_password"
					name="new_password"
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

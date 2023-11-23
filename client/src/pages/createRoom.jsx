import React, { useState, useEffect } from "react";
// import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BackBtn from "../components/BackBtn";

//TODO: add password field to form

const createRoom = () => {
	const navigate = useNavigate();
	// const { user } = useAuth();
	const user = localStorage.getItem("username");

	const [loading, setLoading] = useState(false);
	const [roomName, setRoom] = useState("");

	useEffect(() => {
		setLoading(true);
		if (user === null) {
			setLoading(false);
			navigate("/");
		}
		setLoading(false);
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		axios
			.post(
				"http://localhost:5000/rooms/create",
				{ room_name: roomName, owner: user },
				{ headers: { "Content-Type": "application/json" } }
			)
			.then((res) => {
				if (res.data.success) {
					//change user's curr_room_id to new room
					axios
						.put(
							`http://localhost:5000/users/curr_room/${user}`,
							{ room_id: res.data.room_id },
							{ headers: { "Content-Type": "application/json" } }
						)
						.then((res2) => {
							if (res2.data.success) {
								console.log(
									"Success: user's curr_room_id updated."
								);
								//navigate to new room
								navigate(`/rooms/enter/${res.data.room_id}`);
							} else {
								console.log(res2.data.message);
							}
						})
						.catch((err2) => {
							console.log(
								"An internal server error occured. Room was created, but could not change user's current room."
							);
						});
				}
			})
			.catch((err) => {
				console.log(
					"An internal server error occured. Could not create room."
				);
			});
	};

	return (
		<div className="flex flex-col">
			<BackBtn />
			<h1>Welcome, {user ? user : "Guest"}!</h1>
			<h1>Create Room</h1>
			<form className="flex flex-col" onSubmit={handleSubmit}>
				<input
					className="border"
					value={roomName}
					autoComplete="roomName"
					type="text"
					placeholder="Room Name"
					id="roomName"
					name="roomName"
					onChange={(e) => setRoom(e.target.value)}
				/>
				<button type="submit">Create</button>
			</form>
		</div>
	);
};

export default createRoom;

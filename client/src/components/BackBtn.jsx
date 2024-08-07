import React from "react";
import { Link } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
// import { useAuth } from "../AuthContext";
import axios from "axios";
import { socket } from "../socket";

//TODO: sockets...if someone clicks this button, join their socket to Main room.
//send an emit to update old player room for players that are still in there.

//default is Home
const BackBtn = ({ destination = "/home" }) => {
	// const { user } = useAuth();
	const user = localStorage.getItem("username");

	const handleClick = () => {
		let prev_room_id;
		//find what the previous room's id
		//so we can delete player from player list later
		axios
			.get(`http://localhost:5555/users/user_data/${user}`)
			.then((res) => {
				if (res.data.success) {
					prev_room_id = res.data.user_data.curr_room_id;

					//update user's curr_room_id
					axios
						.put(`http://localhost:5555/users/curr_room/${user}`)
						.then((res3) => {
							if (res3.data.success) {
								//update the room's player list
								axios
									.put(
										`http://localhost:5555/rooms/deleteuser/${prev_room_id}`,
										{ playertodelete: user },
										{
											headers: {
												"Content-Type":
													"application/json",
											},
										}
									)
									.then((res2) => {
										if (res2.data.success) {
											console.log(
												"Success. Both user curr_room_id and room player list updated."
											);
											socket.emit("back_to_home", {
												prev_room_id,
											});
										} else {
											console.log(res2.data.message);
										}
									})
									.catch((err2) =>
										console.log(
											"User curr_room_id updated, but could not update room's player list. Server error."
										)
									);
							} else {
								console.log(
									"Could not update user's curr_room_id."
								);
							}
						})
						.catch((err3) => {
							console.log(
								"An internal server error occured. Could not change user's curr_room_id"
							);
						});
				} else {
					console.log("Could not get user's previous room");
					console.log(res.data.message);
				}
			})
			.catch((err) => {
				console.log("Internal server error. Could not get user data.");
			});
	};

	return (
		<div className="flex" onClick={handleClick}>
			<Link
				to={destination}
				className="bg-sky-800 text-whie px-4 py-1 rounded-1g w-fit"
			>
				<BsArrowLeft className="text-2xl" />
			</Link>
		</div>
	);
};

export default BackBtn;

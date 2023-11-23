import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import BackBtn from "../components/BackBtn";
import Spinner from "../components/Spinner";

//TODO: get rid of user from player's list if they close off the tab...ie, don't actually press the back btn

const enterRoom = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	const [room, setRoom] = useState({});
	const [loading, setLoading] = useState(false);
	const { id } = useParams(); //from the APP route parameters: /rooms/enter/:id (NOTE: it has to be the same variable name as what's used in the Route)

	useEffect(() => {
		setLoading(true);

		//update room's players list
		axios
			.put(
				`http://localhost:5000/rooms/adduser/${id}`,
				{ newplayer: user },
				{ headers: { "Content-Type": "application/json" } }
			)
			.then((res) => {
				if (res.data.success) {
					//update player's curr_room_id to entered room
					axios
						.put(
							`http://localhost:5000/users/curr_room/${user}`,
							{ room_id: id },
							{ headers: { "Content-Type": "application/json" } }
						)
						.then((res2) => {
							if (res2.data.success) {
								console.log(
									"Success. Room's player list and user's curr_room_id updated."
								);
								//get room info
								axios
									.get(`http://localhost:5000/rooms/${id}`)
									.then((res) => {
										setRoom(res.data);
										setLoading(false);
									})
									.catch((err) => {
										console.log(err);
										setLoading(false);
									});
							} else {
								console.log(res2.data.message);
							}
						})
						.catch((err2) => {
							console.log(
								"An internal server error occured. Could not update player's curr_room_id"
							);
						});
				} else {
					//could not add player to room
					console.log(res.data.message);
					navigate("/home");
				}
			})
			.catch((err) => {
				console.log(
					"An internal server error occured. Could not update room's player list"
				);
			});
	}, []);

	return (
		<div className="p-4">
			<BackBtn />
			<h1 className="text-3xl my-4">Enter Room</h1>
			{loading ? (
				<Spinner />
			) : (
				<div className="flex flex-col border-2 border-sky-400 rounded-xl w-fit p-4">
					<div className="my-4">
						<span className="text-xl mr-4 text-gray-500">Id</span>
						<span>{room._id}</span>
					</div>
					<div className="my-4">
						<span className="text-xl mr-4 text-gray-500">
							Owner
						</span>
						<span>{room.owner}</span>
					</div>
					<div className="my-4">
						<span className="text-xl mr-4 text-gray-500">
							Players
						</span>
						<span>{room.players}</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default enterRoom;

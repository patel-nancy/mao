import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import BackBtn from "../components/BackBtn";
import Spinner from "../components/Spinner";

const enterRoom = () => {
	const [room, setRoom] = useState({});
	const [loading, setLoading] = useState(false);
	const { id } = useParams();

	useEffect(() => {
		setLoading(true);
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

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";

const deleteRoom = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		axios
			.delete(`http://localhost:5555/rooms/${id}`)
			.then((res) => {
				setLoading(false);
				if (res.data.success) {
					console.log(res.data.message);
					socket.emit("rooms-updated"); //updates main/home room list for everyone in main
					navigate("/home");
				} else {
					console.log(res.data.message);
				}
			})
			.catch((err) => {
				setLoading(false);
				console.log(err.message);
			});
	}, []);

	return <div></div>;
};

export default deleteRoom;

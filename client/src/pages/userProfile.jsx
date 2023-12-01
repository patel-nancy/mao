import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import axios from "axios";

const userProfile = () => {
	const navigate = useNavigate();
	const username = localStorage.getItem("username");
	if (!username) {
		navigate("/");
	}

	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState({});

	useEffect(() => {
		setLoading(true);

		axios
			.get(`http://localhost:5555/users/user_data/${username}`)
			.then((res) => {
				if (res.data.success) {
					setUser(res.data.user_data);
					setLoading(false);
				}
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
			});
	}, []);

	return (
		<div className="p-4">
			<h1 className="text-3xl my-4">User Profile</h1>
			{loading ? (
				<Spinner />
			) : (
				<div className="flex flex-col border-2 border-sky-400 rounded-xl w-fit p-4">
					<div className="my-4">
						<span className="text-xl mr-4 text-gray-500">
							Username
						</span>
						<span>{username}</span>
					</div>
					<div className="my-4">
						<span className="text-xl mr-4 text-gray-500">Wins</span>
						<span>{user.wins}</span>
					</div>
					<div className="my-4">
						<span className="text-xl mr-4 text-gray-500">
							Losses
						</span>
						<span>{user.losses}</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default userProfile;

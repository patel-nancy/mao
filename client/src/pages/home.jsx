import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import Logout from "../components/Logout";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { MdOutlineAddBox, MdOutlineDelete } from "react-icons/md";

const Home = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [rooms, setRooms] = useState([]); //to update rooms

	useEffect(() => {
		setLoading(true);

		//http request to server
		axios
			.get("http://localhost:5000/rooms/")
			.then((res) => {
				setRooms(res.data.data); //updates to list all rooms
				setLoading(false); //no longer loading
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
			});
	}, []);

	//note: Links are from App.jsx Routes
	return (
		//the div className is a TailwindCSS feature. copied from a tutorial.
		<div className="p-4">
			<h1>Welcome, {user ? user : "Guest"}!</h1>
			<div className="flex justify-between items-center">
				<h1 className="text-3xl my-8">Rooms List</h1>
				<Link to={`/rooms/create`}>
					<MdOutlineAddBox className="text-sky-800 text-4xl" />
				</Link>
			</div>

			{loading ? (
				<Spinner />
			) : (
				<table className="w-full border-separate border-spacing-2">
					<thead>
						<tr>
							<th className="border border-slate-600 rounded-md">
								No
							</th>
							<th className="border border-slate-600 rounded-md">
								Room Name
							</th>
							<th className="border border-slate-600 rounded-md max-md:hidden">
								Owner
							</th>
							{/* column hidden on mobile devices */}
							<th className="border border-slate-600 rounded-md">
								Operations
							</th>
						</tr>
					</thead>
					<tbody>
						{rooms.map((room, index) => (
							<tr key={room._id} className="h-8">
								<td className="border border-slate-700 rounded-md text-center">
									{index + 1}
								</td>
								<td className="border border-slate-700 rounded-md text-center">
									{room.room_name}
								</td>
								<td className="border border-slate-700 rounded-md text-center max-md:hidden">
									{room.owner}
								</td>
								<td className="border border-slate-700 rounded-md text-center">
									<div className="flex justify-center gap-x-4">
										<Link to={`/rooms/enter/${room._id}`}>
											<BsInfoCircle className="text-2xl text-green-800" />
										</Link>
										{/* TODO: only let the user who is the owner delete */}
										<Link to={`/rooms/edit/${room._id}`}>
											<AiOutlineEdit className="text-2xl text-yellow-600" />
										</Link>

										<Link to={`/rooms/delete/${room._id}`}>
											<MdOutlineDelete className="text-2xl text-red-600" />
										</Link>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
			<div>
				<Logout />
			</div>
		</div>
	);
};

export default Home;

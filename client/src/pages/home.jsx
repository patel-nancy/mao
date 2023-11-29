import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import Logout from "../components/Logout";
// import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { MdOutlineAddBox, MdOutlineDelete } from "react-icons/md";
import { socket } from "../socket";

const Home = () => {
	//console.log(socket.connected);
	const navigate = useNavigate();
	// const { user } = useAuth();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [rooms, setRooms] = useState([]); //to update rooms

	useEffect(() => {
		setLoading(true);

		//session username
		const storedUser = localStorage.getItem("username");
		if (storedUser) {
			setUser(storedUser);
			// socket.emit("logged-in");
		} else {
			navigate("/");
		}

		//room data from server
		fetchRooms();

		//update when room created/deleted
		socket.on("update-main-room-list", () => {
			fetchRooms();
		});
	}, []);

	const fetchRooms = async () => {
		try {
			axios
				.get("http://localhost:5555/rooms/")
				.then((res) => {
					setRooms(
						res.data.data.filter(
							(room) => room.room_name !== "Main"
						)
					); //updates to list all rooms (except Main)
					setLoading(false); //no longer loading
				})
				.catch((err) => {
					console.log(err);
					setLoading(false);
				});
		} catch (err) {
			console.error("Error fetching room data: ", err.message);
		}
	};

	function editDelPermissions(room) {
		if (room.owner === user) {
			return true;
		} else {
			return false;
		}
	}

	function testPassword(id) {
		try {
			axios
				.get(`http://localhost:5555/rooms/${id}`)
				.then((res) => {
					const room = res.data;
					console.log(room);

					if (!room.room_password) {
						navigate(`/rooms/enter/${room._id}`);
					} else {
						const userInput = window.prompt(
							"This is a locked room. Please enter the password: "
						);
						if (userInput === room.room_password) {
							navigate(`/rooms/enter/${room._id}`);
						} else {
							alert("Incorrect password!");
						}
					}
				})
				.catch((err) => {
					console.log(err);
				});
		} catch (err) {
			console.error("Error fetching room: ", err.message);
		}
	}

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
										<button
											onClick={() =>
												testPassword(room._id)
											}
										>
											<BsInfoCircle className="text-2xl text-green-800" />
										</button>

										{/*only let the user who is the owner delete */}
										{editDelPermissions(room) && (
											<>
												<Link
													to={`/rooms/edit/${room._id}`}
												>
													<AiOutlineEdit className="text-2xl text-yellow-600" />
												</Link>

												<Link
													to={`/rooms/delete/${room._id}`}
												>
													<MdOutlineDelete className="text-2xl text-red-600" />
												</Link>
											</>
										)}
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

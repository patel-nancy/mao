import React from "react";
import { Link } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";

//default is Home
const BackBtn = ({ destination = "/home" }) => {
	//update user's curr_room_id

	return (
		<div className="flex">
			{/* TODO: the classNames are all copied from the tutorial */}
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

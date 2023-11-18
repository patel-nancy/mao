import React, { useEffect, useState } from "react";
import Login from "../components/Login";
import Register from "../components/Register";

const landing = () => {
	const [currForm, setCurrForm] = useState("Login");

	const toggleForm = (form) => {
		setCurrForm(form);
	};

	return (
		<div className="p-4">
			<div className="flex justify-between items-center">
				{currForm === "Login" ? (
					//onFormToggle is a custom function for the PROP/parent.
					//We pass PROPs in as a param for Login/Register components
					//this allows us to access the PROP/parent's functions
					<Login onFormToggle={toggleForm} />
				) : (
					<Register onFormToggle={toggleForm} />
				)}
			</div>
		</div>
	);
};

export default landing;

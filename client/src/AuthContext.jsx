import React, { createContext, useContext, useReducer } from "react";

const AuthContext = createContext();

const initState = { user: null };
//updating state based on different actions (LOGIN/LOGOUT)
const authReducer = (state, action) => {
	switch (action.type) {
		case "LOGIN":
			return { user: action.payload };
		case "LOGOUT":
			return { user: null };
		default:
			return state;
	}
};

//PROVIDER...gives context (value of user) to all children
const AuthProvider = ({ children }) => {
	//updates user state based on what the authReducer function returns (given the dispatched message params)
	const [state, dispatch] = useReducer(authReducer, initState);

	const login = (user) => {
		dispatch({ type: "LOGIN", payload: user });
	};
	const logout = () => {
		dispatch({ type: "LOGOUT" });
	};

	return (
		<AuthContext.Provider value={{ user: state.user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

//CONSUMER
const useAuth = () => {
	const context = useContext(AuthContext); //get current context value
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export { AuthProvider, useAuth };

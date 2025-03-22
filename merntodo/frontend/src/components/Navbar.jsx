import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../slices/authSlice";
import { Fragment } from "react";

const Navbar = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { token, role, username } = useSelector((state) => state.auth);
	const handleLogout = () => {
		dispatch(logoutUser());
		navigate("/");
	};

	return (
		<nav
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				padding: "20px 50px",
				gap: "20px",
				background: "#333",
				color: "#fff",
			}}
		>
			<h2>MyJira</h2>
			<div>
				{token && (
					<Fragment>
						<span className="navGreet">Welcome , {username.toUpperCase()}</span>
						<Link
							to="/dashboard"
							style={{ color: "#fff", marginRight: "15px" }}
						>
							Dashboard
						</Link>
					</Fragment>
				)}

				{token ? (
					<button
						onClick={handleLogout}
						style={{
							color: "#fff",
							background: "red",
							border: "none",
							padding: "5px 10px",
						}}
					>
						Logout
					</button>
				) : (
					<>
						<Link to="/" style={{ color: "#fff", marginRight: "10px" }}>
							Login
						</Link>
						<Link to="/register" style={{ color: "#fff" }}>
							Register
						</Link>
					</>
				)}
			</div>
		</nav>
	);
};

export default Navbar;

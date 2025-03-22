import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { loading, error } = useSelector((state) => state.auth);

	const handleLogin = async (e) => {
		e.preventDefault();
		const result = await dispatch(loginUser({ email, password }));
		if (result.payload?.token) navigate("/dashboard");
	};

	return (
		<div className="loginContainer">
			<h2>Login</h2>
			{error && <p style={{ color: "red", fontSize: "20px" }}>{error}</p>}
			<form onSubmit={handleLogin}>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button type="submit" disabled={loading}>
					{loading ? "Logging in..." : "Login"}
				</button>
			</form>

			{/* Register Link */}
			<p>
				Don't have an account? <Link to="/register">Register here</Link>
			</p>
		</div>
	);
};

export default Login;

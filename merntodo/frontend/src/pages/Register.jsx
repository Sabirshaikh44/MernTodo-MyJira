import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("user"); // Default role
	const navigate = useNavigate();

	const handleRegister = async (e) => {
		e.preventDefault();
		try {
			await axios.post("http://localhost:5000/api/auth/register", {
				name,
				email,
				password,
				role,
			});
			navigate("/");
		} catch (error) {
			console.error(
				"Registration failed",
				error.response?.data?.message || error.message
			);
		}
	};

	return (
		<div className="registerContainer">
			<h2>Register</h2>
			<form onSubmit={handleRegister}>
				<input
					type="text"
					placeholder="Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
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

				{/* Role Selection */}
				<select value={role} onChange={(e) => setRole(e.target.value)} required>
					<option value="user">User</option>
					<option value="admin">Admin</option>
				</select>

				<button type="submit">Register</button>
			</form>
		</div>
	);
};

export default Register;

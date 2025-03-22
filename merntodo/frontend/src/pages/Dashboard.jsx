import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchTodos,
	addTodo,
	updateTodo,
	deleteTodo,
	completeTodo,
} from "../slices/todoSlice";

import todoImg from "../assets/todoImg.webp";

import ReactPaginate from "react-paginate";

// Chart Js...
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import "../App.css";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
	const dispatch = useDispatch();
	const { todos, completedCount, incompleteCount, totalCount, loading } =
		useSelector((state) => state.todos);
	const { role, token } = useSelector((state) => state.auth);
	const navigate = useNavigate();

	const [newTodo, setNewTodo] = useState("");
	const [editId, setEditId] = useState(null);
	const [editTitle, setEditTitle] = useState("");

	const data = {
		labels: ["Completed", "Incomplete"],
		datasets: [
			{
				data: [completedCount, incompleteCount],
				backgroundColor: ["#36A2EB", "#FF6384"],
				hoverBackgroundColor: ["#2F89C5", "#E05263"],
				borderRadius: 20, // Makes it rounded
				spacing: 5,
			},
		],
	};

	const options = {
		cutout: "90%",
		responsive: true,
		plugins: {
			legend: {
				position: "top",
			},
		},
	};

	const [currentPage, setCurrentPage] = useState(0);
	const [filter, setFilter] = useState("all");
	const itemsPerPage = 5; // Change this value as needed

	const handlePageClick = ({ selected }) => {
		setCurrentPage(selected);
	};

	useEffect(() => {
		if (!token) {
			toast.error("Session expired pls login to continue");
		} else {
			dispatch(fetchTodos());
		}
	}, [dispatch, token]);

	// Filter Todos Based on Status
	const filteredTodos = todos.filter((todo) => {
		if (filter === "completed") return todo.completed;
		if (filter === "incomplete") return !todo.completed;
		return true;
	});

	// Pagination logic after applying filter
	const offset = currentPage * itemsPerPage;
	const currentTodos = filteredTodos.slice(offset, offset + itemsPerPage);
	const pageCount = Math.ceil(filteredTodos.length / itemsPerPage);

	const handleAddTodo = async (e) => {
		e.preventDefault();
		if (newTodo.trim()) {
			try {
				const response = await dispatch(addTodo(newTodo)).unwrap();

				if (response) {
					toast.success(response.message || "Todo added successfully!");
					dispatch(fetchTodos());
					setNewTodo("");
				} else {
					toast.warn(response.message || "Something went wrong!");
				}
			} catch (error) {
				toast.error(error.message || "Failed to add todo!");
			}
		}
	};

	const handleEditTodo = (id, title) => {
		setEditId(id);
		setEditTitle(title);
	};

	const handleUpdateTodo = async (e) => {
		e.preventDefault();
		try {
			const response = await dispatch(
				updateTodo({ id: editId, title: editTitle })
			).unwrap();
			if (response) {
				toast.success(response.message || "Todo updated successfully!");
				dispatch(fetchTodos());
				setEditId(null);
				setEditTitle("");
			} else {
				toast.warn(response.message || "Something went wrong!");
			}
		} catch (error) {
			toast.error(error.message || "Failed to update todo!");
		}
	};

	const handleDeleteTodo = async (id) => {
		try {
			const response = await dispatch(deleteTodo(id)).unwrap();
			if (response) {
				toast.success(response.message || "Todo deleted successfully!");
				dispatch(fetchTodos());
			} else {
				toast.warn(response.message || "Something went wrong!");
			}
		} catch (error) {
			toast.error(error.message || "Failed to delete todo!");
		}
	};

	const handleComplete = async (id) => {
		try {
			const response = await dispatch(completeTodo(id)).unwrap();
			if (response) {
				toast.success(response.message || "Todo mark completed successfully!");
				dispatch(fetchTodos());
			} else {
				toast.warn(response.message || "Something went wrong!");
			}
		} catch (error) {
			toast.error(error.message || "Failed to mark todo completed!");
		}
	};

	return (
		<div className="dashboardContainer">
			<div className="statsChartContainer">
				<img src={todoImg} alt="" srcset="" />

				<div className="chart" style={{ width: "200px", margin: "" }}>
					<p>Todo Completion Chart</p>
					<Doughnut data={data} options={options} />
				</div>
			</div>

			<form
				onSubmit={editId ? handleUpdateTodo : handleAddTodo}
				className="todoFormContainer"
			>
				<label htmlFor="todoInput">Add Todo : </label>
				<input
					type="text"
					className="todoInput"
					placeholder="Enter todo"
					value={editId ? editTitle : newTodo}
					onChange={(e) =>
						editId ? setEditTitle(e.target.value) : setNewTodo(e.target.value)
					}
					required
				/>
				<button type="submit" className="todoSubmitBtn">
					{editId ? "Update" : "Add"}
				</button>
			</form>

			<div className="stats">
				<div className="statsData">
					<p>
						Completed : <span className="count">{completedCount}</span>{" "}
					</p>
					<p>
						InCompleted : <span className="count">{incompleteCount}</span>{" "}
					</p>
					<p>
						Total : <span className="count">{totalCount}</span>{" "}
					</p>
				</div>
				<div className="filter-container">
					<label>Filter:</label>
					<select value={filter} onChange={(e) => setFilter(e.target.value)}>
						<option value="all">All</option>
						<option value="completed">Completed</option>
						<option value="incomplete">Incomplete</option>
					</select>
				</div>
			</div>

			{loading ? (
				<p>Loading...</p>
			) : (
				<Fragment>
					<ul>
						{currentTodos.map((todo) => (
							<li
								key={todo._id}
								style={{
									display: "flex",
									justifyContent: "space-between",
									margin: "10px 0",
								}}
								className={todo.completed ? "completed" : ""}
							>
								<div>
									<h3>{todo.user?.name || "Unknown User"}</h3>
									<span className={todo.completed ? "completed" : ""}>
										{todo.title}
									</span>
								</div>
								<div>
									<button
										onClick={() => handleEditTodo(todo._id, todo.title)}
										className="editBtn"
										hidden={todo.completed}
									>
										Edit
									</button>
									<button
										onClick={() => handleComplete(todo._id)}
										className="editBtn"
										hidden={todo.completed}
									>
										Complete
									</button>
									<button
										onClick={() => handleDeleteTodo(todo._id)}
										style={{ marginLeft: "5px" }}
										disabled={role !== "admin"}
										className={
											role === "admin" ? "deleteBtn" : "disabled deleteBtn"
										}
									>
										Delete
									</button>
								</div>
							</li>
						))}
					</ul>
					{/* Pagination Component */}
					<ReactPaginate
						previousLabel={"← Previous"}
						nextLabel={"Next →"}
						breakLabel={"..."}
						pageCount={pageCount}
						marginPagesDisplayed={2}
						pageRangeDisplayed={3}
						onPageChange={handlePageClick}
						containerClassName={"pagination"}
						activeClassName={"active"}
						previousClassName={"prevBtn"}
						nextClassName={"nextBtn"}
						disabledClassName={"disabled"}
						ohrefAllControls={true}
					/>
				</Fragment>
			)}
		</div>
	);
};

export default Dashboard;

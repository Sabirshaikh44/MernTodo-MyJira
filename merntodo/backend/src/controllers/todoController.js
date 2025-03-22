const { log } = require("console");
const Todo = require("../models/Todo");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


exports.getTodos = async (req, res) => {
    try {
        let todos = null;
        if (req.role === "admin") {
            // Admin can see all todos
            todos = await Todo.find().populate("user", "name email").sort({ completed: 1, createdAt: 1 });

        } else {

            // Fetch todos for the logged-in user
            todos = await Todo.find({ "user": new ObjectId(req.userId) }).populate("user", "name email").sort({ completed: 1, createdAt: 1 });;
        }


        // Count completed and incomplete todos
        const totalCount = todos.length;
        const completedCount = todos.filter(todo => todo.completed).length;
        const incompleteCount = totalCount - completedCount;


        res.status(200).json({ todos, completedCount, incompleteCount, totalCount });
    } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.createTodo = async (req, res) => {
    const { title, description } = req.body;
    const todo = new Todo({ user: req.userId, title, description });
    await todo.save();
    res.status(201).json(todo);
};

exports.updateTodo = async (req, res) => {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    // Users can update only their own todos
    if (req.role !== "admin" && todo.user.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
    }

    todo.title = req.body.title || todo.title;
    todo.completed = req.body.completed ?? todo.completed;
    await todo.save();
    res.status(200).json(todo);
};

exports.deleteTodo = async (req, res) => {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    // Users can delete only their own todos
    if (req.role !== "admin" && todo.user.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
    }

    await todo.deleteOne();
    res.status(200).json({ message: "Todo deleted" });
};

exports.completeTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ message: "Todo not found" });

        // Only allow the user who owns the todo or an admin to mark as complete
        if (req.role !== "admin" && todo.user.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        todo.completed = true; // Mark as complete
        await todo.save();

        res.status(200).json(todo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


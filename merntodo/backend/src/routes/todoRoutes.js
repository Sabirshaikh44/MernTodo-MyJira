const express = require("express");
const { getTodos, createTodo, updateTodo, deleteTodo, completeTodo } = require("../controllers/todoController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Common Routes
router.get("/", authMiddleware, roleMiddleware(["user", "admin"]), getTodos);
router.post("/", authMiddleware, roleMiddleware(["user", "admin"]), createTodo);
router.put("/:id", authMiddleware, roleMiddleware(["user", "admin"]), updateTodo);
router.patch("/:id/complete", authMiddleware, roleMiddleware(["user", "admin"]), completeTodo);

// Admin Routes
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteTodo); // Only admin can delete others' todos

module.exports = router;

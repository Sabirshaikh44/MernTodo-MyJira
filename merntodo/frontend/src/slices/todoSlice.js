import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import { useDispatch } from "react-redux";

import { logoutUser } from "./authSlice";

import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/todos";

// Fetch Todos
export const fetchTodos = createAsyncThunk("todos/fetchTodos", async (_, { getState, rejectWithValue, dispatch }) => {
    try {
        const token = getState().auth.token;
        const { data } = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return data;
    } catch (error) {
        if (error.response?.status === 401) {
            // Dispatch logout action to clear token and role
            dispatch(logoutUser());

            // Redirect user to login page
            window.location.href = "/";

            return rejectWithValue("Session expired. Please log in again.");
        }

        return rejectWithValue(error.response?.data?.message || error.message);
    }

});

// Add Todo
export const addTodo = createAsyncThunk("todos/addTodo", async (title, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const { data } = await axios.post(API_URL, { title }, { headers: { Authorization: `Bearer ${token}` } });
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Update Todo
export const updateTodo = createAsyncThunk("todos/updateTodo", async ({ id, title }, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const { data } = await axios.put(`${API_URL}/${id}`, { title }, { headers: { Authorization: `Bearer ${token}` } });
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Delete Todo
export const deleteTodo = createAsyncThunk("todos/deleteTodo", async (id, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Complete Todo
export const completeTodo = createAsyncThunk("todos/markComplete", async (id, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const { data } = await axios.patch(
            `${API_URL}/${id}/complete`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data; // Return the updated todo
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const clearTodos = createAsyncThunk("todos/clearTodos", async () => []);


const todoSlice = createSlice({
    name: "todos",
    initialState: {
        todos: [],
        completedCount: 0,
        incompleteCount: 0,
        totalCount: 0,
        loading: false,
        error: null
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.todos = action.payload.todos;
                state.completedCount = action.payload.completedCount;
                state.incompleteCount = action.payload.incompleteCount;
                state.totalCount = action.payload.totalCount;
                state.loading = false;
            })
            .addCase(addTodo.fulfilled, (state, action) => {
                state.todos.push(action.payload);
                state.totalCount += 1;
                state.incompleteCount += 1;
            })
            .addCase(updateTodo.fulfilled, (state, action) => {
                const index = state.todos.findIndex((todo) => todo._id === action.payload._id);
                if (index !== -1) state.todos[index] = action.payload;
            })
            .addCase(clearTodos.fulfilled, (state) => {
                state.todos = [];
                state.totalCount = 0;
                state.completedCount = 0;
                state.incompleteCount = 0;
            })
            .addCase(deleteTodo.fulfilled, (state, action) => {
                state.todos = state.todos.filter((todo) => todo._id !== action.payload);
                state.totalCount -= 1;
            })
            .addCase(completeTodo.fulfilled, (state, action) => {
                const index = state.todos.findIndex((todo) => todo._id === action.payload._id);
                if (index !== -1) {
                    state.todos[index] = action.payload;

                    // Update counts dynamically
                    if (action.payload.completed) {
                        state.completedCount += 1;
                        state.incompleteCount -= 1;
                    } else {
                        state.completedCount -= 1;
                        state.incompleteCount += 1;
                    }
                }
            });
    },
});


export default todoSlice.reducer;

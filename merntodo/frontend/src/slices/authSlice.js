import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:5000/api/auth";
const token = localStorage.getItem("token") || null;

let role = null;
let username = null;
if (token) {
    try {
        const decoded = jwtDecode(token);
        role = decoded.role;
        username = decoded.username;
    } catch (error) {
        console.error("Invalid token:", error);
    }
}

export const loginUser = createAsyncThunk("auth/loginUser", async (userData, { rejectWithValue }) => {
    try {
        const { data } = await axios.post(`${API_URL}/login`, userData);
        localStorage.setItem("token", data.token);
        const decoded = jwtDecode(data.token);
        console.log(decoded);

        return { role: decoded.role, token: data.token, username: decoded.username };

    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { dispatch }) => {
    localStorage.removeItem("token");

    const { clearTodos } = await import("./todoSlice");
    dispatch(clearTodos());


    return null;
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        role: role,
        username: username,
        token: token,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.role = null;
            state.token = null;
            localStorage.removeItem("token");
            window.location.href = "/"
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.role = action.payload.role;
                state.username = action.payload.username;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.token = null;
                state.role = null;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

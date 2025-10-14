// src/Redux/Store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Features/AuthSlice";
import { injectStore } from "../Services/Api"; // 👈 api se injectStore import

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// ✅ ab store inject ho gaya api.js ke andar
injectStore(store);

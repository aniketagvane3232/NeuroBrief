// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './slices/searchSlice'; // Import the searchSlice

export const store = configureStore({
  reducer: {
    search: searchReducer, // Add searchReducer to the store
  },
});

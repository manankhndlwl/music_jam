// utils/axios.js

import axios from "axios";

// Create a custom Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Use environment variable for base URL
  timeout: 5000, // Optional: Set a timeout for requests
  headers: {
    "Content-Type": "application/json",
    // You can add more default headers here if needed
  },
});

export default axiosInstance;

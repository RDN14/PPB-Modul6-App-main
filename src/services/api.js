import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "./config.js";

async function request(path, options = {}) {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not set in app.json");
  }

  // Get token from AsyncStorage for authenticated requests
  const token = await AsyncStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers,
    ...options,
  });

  // Handle 401 Unauthorized - logout automatically
  if (response.status === 401) {
    await AsyncStorage.removeItem("authToken");
    throw new Error("Unauthorized. Please login again.");
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export const Api = {
  // Authentication methods
  login(email, password) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  register(email, password, name) {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },
  getProfile() {
    return request("/api/auth/profile");
  },
  
  // Sensor readings with pagination support
  getSensorReadings(page = 1, limit = 10) {
    return request(`/api/readings?page=${page}&limit=${limit}`);
  },
  
  // Threshold methods
  getThresholds() {
    return request("/api/thresholds");
  },
  createThreshold(payload) {
    return request("/api/thresholds", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

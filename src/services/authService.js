const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

/**
 * Helper to get headers
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }
  return headers;
};

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  if (!userData.username || !userData.password) {
    throw new Error('Username and password are required');
  }

  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Registration failed');
  }

  return data;
};

/**
 * Login a user
 */
export async function loginUser(username, password) {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const text = await response.text();

  if (!response.ok) {
    // Try to parse error JSON if any
    let errorMessage = `Server error ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData?.error || errorMessage;
    } catch {
      errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  return JSON.parse(text);
}

/**
 * Logout
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

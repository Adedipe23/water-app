import { AuthToken, LoginCredentials, User, UserCreate } from '../types';

const API_BASE_URL = 'http://localhost:8000';

// Function to register a new user
export const registerUser = async (userData: UserCreate): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Function to login a user
export const loginUser = async (credentials: LoginCredentials): Promise<AuthToken> => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    // Add required OAuth2 parameters
    formData.append('grant_type', 'password');
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Since there's no /users/me endpoint, we'll store user data after registration
// and use it when needed
export const storeUserData = (user: User): void => {
  localStorage.setItem('userData', JSON.stringify(user));
};

// Function to get the current user from localStorage
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Token management
export const setToken = (token: AuthToken): void => {
  localStorage.setItem('token', JSON.stringify(token));
};

export const getToken = (): AuthToken | null => {
  const token = localStorage.getItem('token');
  return token ? JSON.parse(token) : null;
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  // Check if token is expired (if we had expiry info)
  // For now, just check if token exists
  return true;
};

// Get authorization header
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getToken();
  return token ? { Authorization: `${token.token_type} ${token.access_token}` } : {};
};

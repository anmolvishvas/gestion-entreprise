import api, { API_URL } from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface User {
    id: number;
    email: string;
    roles: string[];
}

export interface LoginResponse {
    token: string;
    user: User;
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>(`${API_URL}/auth/login_check`, {
            email: credentials.email,
            password: credentials.password
        });
        
        if (response.data.token) {
            sessionStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
            sessionStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (data: { email: string; password: string }): Promise<User> => {
        const response = await api.post<{ user: User }>(`${API_URL}/register`, data);
        return response.data.user;
    },

    logout: () => {
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        window.location.href = '/login';
    },

    getCurrentUser: (): User | null => {
        const userStr = sessionStorage.getItem(USER_KEY);
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    isAuthenticated: (): boolean => {
        return !!sessionStorage.getItem(AUTH_TOKEN_KEY);
    },

    getToken: (): string | null => {
        return sessionStorage.getItem(AUTH_TOKEN_KEY);
    }
}; 
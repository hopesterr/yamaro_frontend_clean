/// <reference types="vite/client" />

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
console.log('VITE_API_URL utilisé par le frontend :', API_URL);

export interface AuthResponse {
    user: any;
    session: any;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    // Ajoutez d'autres champs si nécessaire
}

class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        if (response.data.session) {
            localStorage.setItem('token', response.data.session.access_token);
        }
        return response.data;
    }

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const response = await axios.post(`${API_URL}/auth/register`, credentials);
        return response.data;
    }

    async logout(): Promise<void> {
        const token = localStorage.getItem('token');
        if (token) {
            await axios.post(`${API_URL}/auth/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem('token');
        }
    }

    async getCurrentUser(): Promise<any> {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const response = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            localStorage.removeItem('token');
            return null;
        }
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }
}

export const authService = new AuthService(); 
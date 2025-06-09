/// <reference types="vite/client" />

import axios from 'axios';
import { supabase } from './supabaseClient';

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

export interface RegisterCredentials extends LoginCredentials {}

class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // Utilise Supabase pour se connecter et stocke le token dans Supabase
        const { data, error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
        return { user: data.user, session: data.session };
    }

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signUp(credentials);
        if (error) throw error;
        return { user: data.user, session: data.session };
    }

    async logout(): Promise<void> {
        await supabase.auth.signOut();
    }

    async getCurrentUser(): Promise<any> {
        // Récupère la session Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) return null;
        const token = session.access_token;
        try {
            // Appelle le backend avec le token Supabase
            const response = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return null;
        }
    }

    isAuthenticated(): boolean {
        // Vérifie la session Supabase
        return !!supabase.auth.getSession();
    }
}

export const authService = new AuthService(); 
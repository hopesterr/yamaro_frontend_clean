import axios from 'axios';
import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

export interface Movie {
    id: string;
    title: string;
    release_date: string;
    poster_path: string;
}

export interface RatedMovie {
    movie_id: string;
    rating: number;
}

class RatingService {
    async getUserRatings(userId: string): Promise<RatedMovie[]> {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        console.log('[getUserRatings] userId utilisé :', userId);
        const response = await axios.get(`${API_URL}/api/ratings/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('[getUserRatings] Réponse API :', response.data);
        return response.data;
    }

    async saveRating(movieId: string, rating: number, userId: string): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        console.log('[saveRating] Début de la sauvegarde - movieId:', movieId, 'rating:', rating, 'userId:', userId);
        console.log('[saveRating] Token présent:', !!token);
        try {
            const response = await axios.post(`${API_URL}/api/ratings`, {
                movie_id: movieId,
                rating,
                user_id: userId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('[saveRating] Réponse du serveur:', response.data);
        } catch (error) {
            console.error('[saveRating] Erreur lors de la sauvegarde:', error);
            throw error;
        }
    }

    async getRating(movieId: string, userId: string): Promise<number | undefined> {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        try {
            const response = await axios.get(`${API_URL}/api/ratings/${userId}/${movieId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.rating;
        } catch (error) {
            return undefined;
        }
    }
}

export const ratingService = new RatingService(); 
import axios from 'axios';

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
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/ratings/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async saveRating(movieId: string, rating: number, userId: string): Promise<void> {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/api/ratings`, {
            movie_id: movieId,
            rating,
            user_id: userId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    async getRating(movieId: string, userId: string): Promise<number | undefined> {
        const token = localStorage.getItem('token');
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
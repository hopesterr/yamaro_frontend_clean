import axios from 'axios';
import { Movie } from '../types/types';

// Assurez-vous que la clé API est correctement importée depuis le fichier key.env
const API_KEY = 'a04ee7a001ff2732d5ccd9e003aeaddd';
const BASE_URL = 'https://api.themoviedb.org/3';

// IDs des genres à exclure
const EXCLUDED_GENRE_IDS = [
    99,    // Documentaire
    10770, // Téléfilm
    10759, // Action & Aventure (TV)
    10762, // Enfants (TV)
    10763, // News (TV)
    10764, // Reality (TV)
    10765, // Science-Fiction & Fantasy (TV)
    10766, // Soap (TV)
    10767, // Talk (TV)
    10768  // Guerre & Politique (TV)
];

export const tmdbApi = {
    getNowPlaying: async (): Promise<Movie[]> => {
        try {
            console.log('Fetching movies from TMDB...');
            const response = await axios.get(
                `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=fr-FR&page=1`
            );
            console.log('Response from TMDB:', response.data);
            return response.data.results;
        } catch (error) {
            console.error('Error fetching now playing movies:', error);
            if (axios.isAxiosError(error)) {
                console.error('API Error details:', error.response?.data);
            }
            return [];
        }
    },

    searchMovies: async (query: string): Promise<Movie[]> => {
        try {
            if (!query.trim()) return [];
            
            console.log('Searching for:', query);
            const response = await axios.get(
                `${BASE_URL}/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=1&include_adult=false`
            );
            
            console.log('Search response:', response.data);
            
            // Filtrer les films pour exclure les genres non désirés et les films sans image
            const movies = response.data.results
                .filter((movie: any) => {
                    // Vérifier si le film n'a aucun genre exclu
                    const hasNoExcludedGenres = !movie.genre_ids?.some((genreId: number) => 
                        EXCLUDED_GENRE_IDS.includes(genreId)
                    );
                    // Vérifier si le film a une image
                    const hasImage = movie.poster_path !== null;
                    
                    return hasNoExcludedGenres && hasImage;
                })
                .map((movie: any) => ({
                    id: movie.id,
                    title: movie.title,
                    overview: movie.overview || '',
                    poster_path: movie.poster_path,
                    release_date: movie.release_date,
                    vote_average: movie.vote_average,
                    genre_ids: movie.genre_ids || []
                }))
                .filter((movie: Movie) => movie.release_date && movie.title);

            console.log('Filtered movies (with images only):', movies);
            return movies;
        } catch (error) {
            console.error('Error searching movies:', error);
            return [];
        }
    },

    getMovieDetails: async (movieId: number): Promise<Movie | null> => {
        try {
            const response = await axios.get(
                `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=fr-FR`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    }
}; 
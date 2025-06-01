export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    genre_ids?: number[];
}

export interface UserRating {
    movieId: number;
    rating: number;
    watchedDate: string;
}

export interface User {
    id: string;
    username: string;
    ratings: UserRating[];
} 
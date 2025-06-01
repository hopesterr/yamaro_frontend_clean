import React from 'react';
import { Card, CardContent, CardMedia, Typography, Rating, Box } from '@mui/material';
import { Movie } from '../types/types';

interface MovieCardProps {
    movie: Movie;
    userRating?: number;
    onRatingChange?: (rating: number) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, userRating, onRatingChange }) => {
    return (
        <Card sx={{ maxWidth: 345, m: 2 }}>
            <CardMedia
                component="img"
                height="500"
                image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
            />
            <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                    {movie.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {movie.overview.length > 100 
                        ? `${movie.overview.substring(0, 100)}...` 
                        : movie.overview}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                        Note TMDB: {movie.vote_average}/10
                    </Typography>
                    {onRatingChange && (
                        <Box>
                            <Typography component="legend">Votre note</Typography>
                            <Rating
                                value={userRating || 0}
                                onChange={(_, newValue) => {
                                    if (onRatingChange && newValue !== null) {
                                        onRatingChange(newValue);
                                    }
                                }}
                                max={5}
                                precision={0.5}
                            />
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default MovieCard; 
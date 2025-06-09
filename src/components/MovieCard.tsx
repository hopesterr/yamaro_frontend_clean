import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Rating, Box, Chip, Stack, Skeleton } from '@mui/material';
import { Movie } from '../types/types';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface MovieCardProps {
    movie: Movie;
    userRating?: number;
    onRatingChange?: (rating: number) => void;
    sx?: object;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, userRating, onRatingChange, sx }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // URL de base pour les images TMDB
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    const posterUrl = movie.poster_path ? `${imageBaseUrl}${movie.poster_path}` : null;

    // Image de fallback SVG pour les affiches manquantes
    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNDA0MDQwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjODA4MDgwIiBmb250LXNpemU9IjE0Ij5BdWN1bmU8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjODA4MDgwIiBmb250LXNpemU9IjE0Ij5hZmZpY2hlPC90ZXh0Pgo8L3N2Zz4=';

    return (
        <Card 
            sx={{ 
                width: '100%',
                maxWidth: 280,
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                    '& .movie-overlay': {
                        opacity: 1,
                    },
                    '& .poster-image': {
                        transform: 'scale(1.05)',
                    }
                },
                ...sx
            }}
        >
            {/* Container pour l'affiche avec aspect ratio fixe */}
            <Box sx={{ position: 'relative', width: '100%', aspectRatio: '2/3' }}>
                {/* Skeleton pendant le chargement */}
                {!imageLoaded && !imageError && (
                    <Skeleton 
                        variant="rectangular" 
                        sx={{ 
                            width: '100%', 
                            height: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }} 
                    />
                )}
                
                <CardMedia
                    component="img"
                    image={imageError || !posterUrl ? fallbackImage : posterUrl}
                    alt={movie.title}
                    className="poster-image"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                        setImageError(true);
                        setImageLoaded(true);
                    }}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: imageLoaded ? 'block' : 'none',
                        transition: 'transform 0.3s ease-in-out',
                    }}
                />

                {/* Overlay avec synopsis */}
                <Box
                    className="movie-overlay"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease-in-out',
                        display: 'flex',
                        alignItems: 'flex-end',
                        p: 2,
                    }}
                >
                    <Typography 
                        variant="body2" 
                        color="white" 
                        sx={{ 
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.3,
                        }}
                    >
                        {movie.overview || 'Aucun synopsis disponible'}
                    </Typography>
                </Box>

                {/* Badge avec la note utilisateur si présente */}
                {userRating && !onRatingChange && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: '50%',
                            width: 44,
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 2,
                            zIndex: 2,
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 'bold',
                                fontSize: '0.8rem'
                            }}
                        >
                            {userRating}/5
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Contenu textuel */}
            <CardContent sx={{ 
                flexGrow: 1, 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
            }}>
                <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '2.4em',
                        mb: 0
                    }}
                >
                    {movie.title}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip 
                        icon={<StarIcon sx={{ fontSize: '0.9rem' }} />}
                        label={`${movie.vote_average.toFixed(1)}/10`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                    />
                    {movie.release_date && (
                        <Chip 
                            label={new Date(movie.release_date).getFullYear()}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                        />
                    )}
                </Stack>

                {/* Section de notation interactive */}
                {onRatingChange && (
                    <Box sx={{ mt: 'auto', pt: 1 }}>
                        <Typography 
                            component="legend" 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mb: 0.5, fontSize: '0.8rem' }}
                        >
                            Votre note
                        </Typography>
                        <Rating
                            value={userRating || 0}
                            onChange={(_, newValue) => {
                                if (onRatingChange && newValue !== null) {
                                    onRatingChange(newValue);
                                }
                            }}
                            max={5}
                            precision={0.5}
                            icon={<StarIcon fontSize="inherit" />}
                            emptyIcon={<StarBorderIcon fontSize="inherit" />}
                            sx={{
                                fontSize: '1.2rem',
                                '& .MuiRating-iconFilled': {
                                    color: 'primary.main',
                                },
                                '& .MuiRating-iconHover': {
                                    color: 'primary.light',
                                },
                            }}
                        />
                    </Box>
                )}

                {/* Affichage de la note utilisateur en mode lecture seule */}
                {userRating && !onRatingChange && (
                    <Box sx={{ mt: 'auto', pt: 1 }}>
                        <Typography 
                            component="legend" 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mb: 0.5, fontSize: '0.8rem' }}
                        >
                            Votre note
                        </Typography>
                        <Rating
                            value={userRating}
                            max={5}
                            precision={0.5}
                            readOnly
                            icon={<StarIcon fontSize="inherit" />}
                            emptyIcon={<StarBorderIcon fontSize="inherit" />}
                            sx={{
                                fontSize: '1.2rem',
                                '& .MuiRating-iconFilled': {
                                    color: 'primary.main',
                                },
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default MovieCard;
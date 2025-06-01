import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, FormControl, Select, MenuItem, InputLabel, Stack, CircularProgress } from '@mui/material';
import MovieCard from '../components/MovieCard';
import { ratingService } from '../services/ratingService';
import { authService } from '../services/authService';
import { tmdbApi } from '../services/tmdbApi';

type SortOrder = 'newest' | 'oldest';

const Profile = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalRatings: 0, averageRating: 0 });
    const [ratedMovies, setRatedMovies] = useState<any[]>([]);
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                setUser(currentUser);
                
                // Charger les films notés de l'utilisateur
                const userRatings = await ratingService.getUserRatings(currentUser.id);
                // Pour chaque note, récupérer les infos du film via TMDB
                const ratedMoviesWithDetails = await Promise.all(
                    userRatings.map(async ({ movie_id, rating }) => {
                        const movie = await tmdbApi.getMovieDetails(Number(movie_id));
                        return movie ? { movie, rating } : null;
                    })
                );
                // Filtrer les films non trouvés
                const filteredRatedMovies = ratedMoviesWithDetails.filter(Boolean);
                setRatedMovies(filteredRatedMovies);
                // Calculer les statistiques
                const userStats = calculateStats(filteredRatedMovies);
                setStats(userStats);
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [navigate]);

    const calculateStats = (ratings: any[]) => {
        if (ratings.length === 0) {
            return { totalRatings: 0, averageRating: 0 };
        }

        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((sum, item) => sum + item.rating, 0);
        const averageRating = sumRatings / totalRatings;

        return { totalRatings, averageRating };
    };

    const handleRatingChange = async (movieId: string, newRating: number) => {
        try {
            await ratingService.saveRating(movieId, newRating, user.id);
            const updatedRatings = await ratingService.getUserRatings(user.id);
            setRatedMovies(updatedRatings);
            setStats(calculateStats(updatedRatings));
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la note:', error);
        }
    };

    const sortMovies = (movies: any[]) => {
        return [...movies].sort((a, b) => {
            const dateA = new Date(a.movie.release_date).getTime();
            const dateB = new Date(b.movie.release_date).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const sortedMovies = sortMovies(ratedMovies);

    return (
        <Box sx={{ 
            flexGrow: 1, 
            p: { 
                xs: 2,
                sm: 3,
                md: 4
            } 
        }}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom>
                    Mon Profil
                </Typography>
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Statistiques
                    </Typography>
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={3} 
                        sx={{ width: '100%' }}
                    >
                        <Paper sx={{ p: 2, textAlign: 'center', flex: 1 }}>
                            <Typography variant="h4">{stats.totalRatings}</Typography>
                            <Typography>Films notés</Typography>
                        </Paper>
                        <Paper sx={{ p: 2, textAlign: 'center', flex: 1 }}>
                            <Typography variant="h4">
                                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
                            </Typography>
                            <Typography>Note moyenne</Typography>
                        </Paper>
                    </Stack>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
                    <Typography variant="h5">
                        Films notés
                    </Typography>
                    {ratedMovies.length > 0 && (
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel id="sort-order-label">Trier par date</InputLabel>
                            <Select
                                labelId="sort-order-label"
                                value={sortOrder}
                                label="Trier par date"
                                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                            >
                                <MenuItem value="newest">Plus récents d'abord</MenuItem>
                                <MenuItem value="oldest">Plus anciens d'abord</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                </Box>

                {ratedMovies.length === 0 ? (
                    <Typography>Vous n'avez pas encore noté de films</Typography>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)'
                            },
                            gap: 3,
                            mt: 3
                        }}
                    >
                        {sortedMovies.map(({ movie, rating }) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                userRating={rating}
                                onRatingChange={(newRating) => handleRatingChange(movie.id, newRating)}
                            />
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default Profile; 
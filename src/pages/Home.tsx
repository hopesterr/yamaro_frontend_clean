import { useState, useCallback, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { tmdbApi } from '../services/tmdbApi';
import { ratingService } from '../services/ratingService';
import { authService } from '../services/authService';
import { Movie } from '../types/types';

const MOVIES_PER_PAGE = 15; // 3 colonnes × 5 lignes

const Home = () => {
    const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [userRatings, setUserRatings] = useState<{[key: string]: number}>({});
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [snackbar, setSnackbar] = useState<{open: boolean; message: string}>({
        open: false,
        message: ''
    });

    // Charger l'utilisateur connecté
    useEffect(() => {
        const loadUser = async () => {
            const user = await authService.getCurrentUser();
            console.log('[Home] Utilisateur courant:', user);
            setCurrentUser(user);
            if (user) {
                const ratings = await ratingService.getUserRatings(user.id);
                const ratingsMap = ratings.reduce((acc, { movie_id, rating }) => {
                    acc[movie_id] = rating;
                    return acc;
                }, {} as {[key: string]: number});
                setUserRatings(ratingsMap);
            }
        };
        loadUser();
    }, []);

    // Charger les films à l'affiche
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                setError(null);
                const movies = await tmdbApi.getNowPlaying();
                setNowPlayingMovies(movies);
            } catch (err) {
                console.error('Error in component:', err);
                setError('Erreur lors du chargement des films');
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    const handleRatingChange = useCallback(async (movie: Movie, rating: number) => {
        if (!currentUser) {
            setSnackbar({
                open: true,
                message: 'Vous devez être connecté pour noter un film'
            });
            return;
        }

        try {
            await ratingService.saveRating(movie.id.toString(), rating, currentUser.id);
            setUserRatings(prev => ({
                ...prev,
                [movie.id]: rating
            }));
            setSnackbar({
                open: true,
                message: `Note enregistrée pour ${movie.title}`
            });
        } catch (error) {
            console.error('Error saving rating:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors de l\'enregistrement de la note'
            });
        }
    }, [currentUser]);

    const handleMovieSelect = useCallback((movie: Movie) => {
        setNowPlayingMovies(prev => {
            if (!prev.find(m => m.id === movie.id)) {
                const newMovies = [movie, ...prev];
                return newMovies.slice(0, MOVIES_PER_PAGE);
            }
            return prev;
        });
        setSearchResults([]);
        setIsSearching(false);
    }, []);

    // Filtrer les films déjà notés
    const filteredMovies = useMemo(() => {
        const filtered = isSearching 
            ? searchResults 
            : nowPlayingMovies.filter(movie => !userRatings[movie.id]);
        return filtered.slice(0, MOVIES_PER_PAGE);
    }, [isSearching, searchResults, nowPlayingMovies, userRatings]);

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            flexGrow: 1, 
            p: { 
                xs: 2, // 16px sur mobile
                sm: 3, // 24px sur tablette
                md: 4  // 32px sur desktop
            } 
        }}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom>
                    {isSearching ? 'Résultats de recherche' : 'Films à l\'affiche'}
                </Typography>

                <SearchBar 
                    onMovieSelect={handleMovieSelect}
                />
                
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
                    {filteredMovies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            userRating={userRatings[movie.id]}
                            onRatingChange={(rating) => handleRatingChange(movie, rating)}
                        />
                    ))}
                </Box>

                {filteredMovies.length === 0 && (
                    <Typography align="center" sx={{ mt: 4 }}>
                        {isSearching ? 'Aucun film trouvé' : 'Aucun film à l\'affiche'}
                    </Typography>
                )}
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Home; 
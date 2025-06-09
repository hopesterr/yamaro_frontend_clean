import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Avatar, Paper, Stack, CircularProgress, Grid } from '@mui/material';
import MovieCard from '../components/MovieCard';
import { tmdbApi } from '../services/tmdbApi';
import { Movie } from '../types/types';

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  email?: string;
}

interface Rating {
  movie_id: string;
  rating: number;
}

const PublicProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [movies, setMovies] = useState<{ movie: Movie; rating: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/public-profile/${userId}`);
        setProfile(data.profile);
        setRatings(data.ratings);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (ratings.length === 0) return;
      const moviesWithDetails = await Promise.all(
        ratings.map(async ({ movie_id, rating }) => {
          try {
            const movie = await tmdbApi.getMovieDetails(Number(movie_id));
            if (!movie) return null;
            const movieTyped: Movie = {
              id: movie.id,
              title: movie.title,
              overview: movie.overview || '',
              poster_path: movie.poster_path || null,
              release_date: movie.release_date || '',
              vote_average: movie.vote_average || 0,
              genre_ids: movie.genre_ids || [],
            };
            return { movie: movieTyped, rating };
          } catch {
            return null;
          }
        })
      );
      setMovies(moviesWithDetails.filter(Boolean) as { movie: Movie; rating: number }[]);
    };
    fetchMovies();
  }, [ratings]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ color: 'red', p: 4 }}>{error}</Box>;
  if (!profile) return <Box sx={{ color: 'white', p: 4 }}>Profil introuvable</Box>;

  // Stats
  const totalRatings = movies.length;
  const averageRating = totalRatings > 0 ? (movies.reduce((sum, m) => sum + m.rating, 0) / totalRatings).toFixed(1) : '-';

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Avatar src={profile.avatar_url || undefined} sx={{ width: 100, height: 100, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
          {profile.username || profile.email}
        </Typography>
        {profile.bio && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            {profile.bio}
          </Typography>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ width: '100%', justifyContent: 'center', mb: 2 }}>
          <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
            <Typography variant="h5">{totalRatings}</Typography>
            <Typography>Films notés</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
            <Typography variant="h5">{averageRating}</Typography>
            <Typography>Note moyenne</Typography>
          </Paper>
        </Stack>
      </Box>
      
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        Films notés
      </Typography>
      
      {movies.length === 0 ? (
        <Typography align="center">Aucun film noté</Typography>
      ) : (
        <Grid 
          container 
          spacing={{ xs: 2, sm: 3, md: 4 }} 
          justifyContent="center"
          sx={{
            // Amélioration responsive
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(auto-fill, minmax(160px, 1fr))', // Mobile: plus petites cartes
              sm: 'repeat(auto-fill, minmax(180px, 1fr))', // Tablette: taille moyenne
              md: 'repeat(auto-fill, minmax(200px, 1fr))', // Desktop: taille optimale
              lg: 'repeat(auto-fill, minmax(220px, 1fr))', // Large: plus spacieux
            },
            gap: { xs: 2, sm: 3, md: 4 },
            justifyItems: 'center',
            alignItems: 'start',
          }}
        >
          {movies.map(({ movie, rating }) => (
            <Box 
              key={movie.id}
              sx={{
                width: '100%',
                maxWidth: '250px', // Limite la largeur maximale
                display: 'flex',
                justifyContent: 'center',
                // Animation au survol
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <MovieCard 
                movie={movie} 
                userRating={rating}
                // Props additionnelles pour optimiser l'affichage si votre MovieCard les supporte
                sx={{
                  width: '100%',
                  aspectRatio: '2/3', // Ratio standard pour les affiches de films
                  '& .MuiCardMedia-root': {
                    aspectRatio: '2/3',
                    objectFit: 'cover',
                  },
                  '& .MuiCard-root': {
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  },
                  '& .MuiCardContent-root': {
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }
                }}
              />
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PublicProfile;
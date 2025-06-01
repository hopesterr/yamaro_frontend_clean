import React, { useState, useCallback, useEffect } from 'react';
import { TextField,  InputAdornment,  IconButton, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar,Box, Typography, CircularProgress} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { tmdbApi } from '../services/tmdbApi';
import { Movie } from '../types/types';
import { debounce } from 'lodash';

interface SearchBarProps {
    onSearch: (query: string) => Promise<void>;
    onMovieSelect: (movie: Movie) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onMovieSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Créer une version debounced de la fonction de recherche
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            setLoading(true);
            try {
                const searchResults = await tmdbApi.searchMovies(query);
                setResults(searchResults);
                setShowResults(true);
            } catch (error) {
                console.error('Erreur lors de la recherche:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    // Nettoyer le debounce lors du démontage du composant
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim()) {
            debouncedSearch(value);
        } else {
            setResults([]);
            setShowResults(false);
        }
    }, [debouncedSearch]);

    const handleClear = useCallback(() => {
        setSearchTerm('');
        setResults([]);
        setShowResults(false);
        debouncedSearch.cancel();
        onSearch('');
    }, [debouncedSearch, onSearch]);

    const handleMovieClick = (movie: Movie) => {
        onMovieSelect(movie);
        handleClear();
    };

    return (
        <Box sx={{ position: 'relative', maxWidth: 600, mx: 'auto', mb: 4 }}>
            <TextField
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Rechercher un film..."
                variant="outlined"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                        <InputAdornment position="end">
                            {loading ? (
                                <CircularProgress size={20} />
                            ) : (
                                <IconButton onClick={handleClear} size="small">
                                    <ClearIcon />
                                </IconButton>
                            )}
                        </InputAdornment>
                    )
                }}
            />
            {showResults && (
                <Paper 
                    sx={{ 
                        position: 'absolute', 
                        width: '100%', 
                        maxHeight: 400, 
                        overflow: 'auto',
                        mt: 1,
                        zIndex: 1000
                    }}
                    elevation={3}
                >
                    <List>
                        {loading ? (
                            <ListItem>
                                <ListItemText 
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <CircularProgress size={20} />
                                            <Typography>Recherche en cours...</Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ) : results.length > 0 ? (
                            results.map((movie) => (
                                <ListItem
                                    key={movie.id}
                                    component="li"
                                    onClick={() => handleMovieClick(movie)}
                                    sx={{ 
                                        '&:hover': { 
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                                        } 
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : undefined}
                                            alt={movie.title}
                                            variant="rounded"
                                        >
                                            {movie.title[0]}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={
                                            <Typography variant="subtitle1">
                                                {movie.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" component="span">
                                                    {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
                                                </Typography>
                                                {movie.overview && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ display: 'block', mt: 0.5 }}
                                                    >
                                                        {movie.overview.length > 100 
                                                            ? `${movie.overview.substring(0, 100)}...` 
                                                            : movie.overview}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText primary="Aucun film trouvé" />
                            </ListItem>
                        )}
                    </List>
                </Paper>
            )}
        </Box>
    );
};

export default SearchBar; 
import React, { useState, useCallback } from 'react';
import { 
    TextField, 
    InputAdornment, 
    IconButton, 
    Paper, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemAvatar, 
    Avatar,
    Box, 
    Typography, 
    CircularProgress,
    Fade,
    Popper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { tmdbApi } from '../services/tmdbApi';
import { Movie } from '../types/types';
import { debounce } from 'lodash';

interface SearchBarProps {
    onMovieSelect: (movie: Movie) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onMovieSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleSearchChange = useCallback(
        debounce(async (value: string) => {
            if (value.trim()) {
                setLoading(true);
                try {
                    const searchResults = await tmdbApi.searchMovies(value);
                    setResults(searchResults);
                } catch (error) {
                    console.error('Erreur lors de la recherche:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300),
        []
    );

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
        setAnchorEl(event.currentTarget);
        handleSearchChange(value);
    };

    const handleClear = () => {
        setSearchTerm('');
        setResults([]);
        setAnchorEl(null);
    };

    const handleMovieClick = (movie: Movie) => {
        onMovieSelect(movie);
        handleClear();
    };

    const open = Boolean(anchorEl) && (searchTerm.length > 0 || loading);

    return (
        <Box sx={{ position: 'relative', maxWidth: 600, mx: 'auto', mb: 4 }}>
            <TextField
                fullWidth
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Rechercher un film..."
                variant="outlined"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="primary" />
                        </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                        <InputAdornment position="end">
                            {loading ? (
                                <CircularProgress size={20} color="primary" />
                            ) : (
                                <IconButton 
                                    onClick={handleClear} 
                                    size="small"
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(124, 77, 255, 0.08)',
                                        },
                                    }}
                                >
                                    <ClearIcon />
                                </IconButton>
                            )}
                        </InputAdornment>
                    )
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'rgba(124, 77, 255, 0.5)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                        },
                    },
                }}
            />
            
            <Popper
                open={open}
                anchorEl={anchorEl}
                placement="bottom-start"
                style={{ width: anchorEl?.clientWidth }}
                transition
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Paper 
                            elevation={3}
                            sx={{ 
                                mt: 1,
                                maxHeight: 400,
                                overflow: 'auto',
                                backgroundColor: 'background.paper',
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(124, 77, 255, 0.5)',
                                    borderRadius: '4px',
                                },
                            }}
                        >
                            <List>
                                {loading ? (
                                    <ListItem>
                                        <ListItemText 
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <CircularProgress size={20} color="primary" />
                                                    <Typography>Recherche en cours...</Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ) : results.length > 0 ? (
                                    results.map((movie) => (
                                        <ListItem
                                            key={movie.id}
                                            button
                                            onClick={() => handleMovieClick(movie)}
                                            sx={{ 
                                                '&:hover': { 
                                                    backgroundColor: 'rgba(124, 77, 255, 0.08)',
                                                },
                                                transition: 'background-color 0.2s ease-in-out',
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : undefined}
                                                    alt={movie.title}
                                                    variant="rounded"
                                                    sx={{ width: 40, height: 60 }}
                                                >
                                                    {movie.title[0]}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={movie.title}
                                                secondary={
                                                    <Typography variant="body2" color="text.secondary">
                                                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Date inconnue'}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText 
                                            primary={
                                                <Typography color="text.secondary">
                                                    Aucun résultat trouvé
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </Box>
    );
};

export default SearchBar; 
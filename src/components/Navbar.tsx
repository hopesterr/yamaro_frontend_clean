import React, { useState, useEffect, ReactElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Container,
    useScrollTrigger,
    Slide,
    Avatar,
    Tooltip
} from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import { supabase } from '../services/supabaseClient';

interface Props {
    window?: () => Window;
    children: ReactElement;
}

const HideOnScroll = (props: Props) => {
    const { children, window } = props;
    const trigger = useScrollTrigger({
        target: window ? window() : undefined,
    });

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
};

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        // Vérifier l'état de la session au chargement
        checkSession();

        // Écouter les changements d'état de la session
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        handleClose();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <HideOnScroll>
            <AppBar position="sticky" color="default" elevation={0}>
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                onClick={() => navigate('/')}
                                sx={{ mr: 2 }}
                            >
                                <MovieIcon />
                            </IconButton>
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate('/')}
                            >
                                Yamaro
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {isAuthenticated ? (
                                <>
                                    <Button
                                        color="inherit"
                                        onClick={() => navigate('/friends')}
                                        sx={{
                                            position: 'relative',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                width: isActive('/friends') ? '100%' : '0%',
                                                height: '2px',
                                                bottom: 0,
                                                left: 0,
                                                backgroundColor: 'primary.main',
                                                transition: 'width 0.3s ease-in-out',
                                            },
                                            '&:hover::after': {
                                                width: '100%',
                                            },
                                        }}
                                    >
                                        Amis
                                    </Button>
                                    <Tooltip title="Menu du compte">
                                        <IconButton
                                            size="large"
                                            onClick={handleMenu}
                                            color="inherit"
                                        >
                                            <Avatar sx={{ width: 32, height: 32 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    >
                                        <MenuItem onClick={() => {
                                            handleClose();
                                            navigate('/profile');
                                        }}>
                                            Mon Profil
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            Déconnexion
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/login')}
                                    variant="outlined"
                                    sx={{
                                        borderColor: 'primary.main',
                                        '&:hover': {
                                            borderColor: 'primary.light',
                                            backgroundColor: 'rgba(124, 77, 255, 0.08)',
                                        },
                                    }}
                                >
                                    Connexion
                                </Button>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </HideOnScroll>
    );
};

export default Navbar; 
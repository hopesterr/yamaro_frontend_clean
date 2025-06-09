import  { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, Avatar, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { PersonRemove, Check, Close } from '@mui/icons-material';
import axios from 'axios';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';



interface User {
    id: string;
    email: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
}

interface Friendship {
    id: string;
    status: string;
    created_at: string;
    friend: User;
}

interface PendingRequest {
    id: string;
    created_at: string;
    user: User;
}

const FriendList = () => {
    const navigate = useNavigate();
    const [friends, setFriends] = useState<Friendship[]>([]);
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<Friendship | null>(null);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }
        fetchFriends();
        fetchPendingRequests();
    };

    const getAuthConfig = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return undefined;
        }
        return {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }
        };
    };

    const fetchFriends = async () => {
        try {
            const config = await getAuthConfig();
            if (!config) return;
            const response = await axios.get('/api/friends/list', config);
            setFriends(response.data);
        } catch (error: any) {
            console.error('Erreur lors de la récupération des amis:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const config = await getAuthConfig();
            if (!config) return;
            const response = await axios.get('/api/friends/pending', config);
            setPendingRequests(response.data);
        } catch (error: any) {
            console.error('Erreur lors de la récupération des demandes:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleAcceptRequest = async (friendshipId: string) => {
        try {
            const config = await getAuthConfig();
            await axios.post(`/api/friends/accept/${friendshipId}`, {}, config);
            fetchPendingRequests();
            fetchFriends();
        } catch (error) {
            console.error('Erreur lors de l\'acceptation de la demande:', error);
        }
    };

    const handleRejectRequest = async (friendshipId: string) => {
        try {
            const config = await getAuthConfig();
            await axios.post(`/api/friends/reject/${friendshipId}`, {}, config);
            fetchPendingRequests();
        } catch (error) {
            console.error('Erreur lors du rejet de la demande:', error);
        }
    };

    const handleRemoveFriend = async (friendshipId: string) => {
        try {
            const config = await getAuthConfig();
            await axios.delete(`/api/friends/${friendshipId}`, config);
            fetchFriends();
            setOpenDialog(false);
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'ami:', error);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: '0 auto', p: 2 }}>
            <Typography variant="h5" gutterBottom>
                Mes Amis
            </Typography>

            {/* Liste des demandes en attente */}
            {pendingRequests.length > 0 && (
                <Box mb={3}>
                    <Typography variant="h6" gutterBottom>
                        Demandes en attente
                    </Typography>
                    <List>
                        {pendingRequests.map((request) => (
                            <ListItem
                                key={request.id}
                                secondaryAction={
                                    <Box>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleAcceptRequest(request.id)}
                                            color="primary"
                                        >
                                            <Check />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleRejectRequest(request.id)}
                                            color="error"
                                        >
                                            <Close />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <Avatar
                                    src={request.user.avatar_url}
                                    sx={{ mr: 2 }}
                                />
                                <Typography>
                                    {request.user.username || request.user.email}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            {/* Liste des amis */}
            <List>
                {friends.map((friendship) => (
                    <ListItem
                        key={friendship.id}
                        button
                        onClick={() => navigate(`/profile/${friendship.friend.id}`)}
                        secondaryAction={
                            <IconButton
                                edge="end"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFriend(friendship);
                                    setOpenDialog(true);
                                }}
                                color="error"
                            >
                                <PersonRemove />
                            </IconButton>
                        }
                    >
                        <Avatar
                            src={friendship.friend.avatar_url}
                            sx={{ mr: 2 }}
                        />
                        <Typography>
                            {friendship.friend.username || friendship.friend.email}
                        </Typography>
                    </ListItem>
                ))}
            </List>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Supprimer l'ami</DialogTitle>
                <DialogContent>
                    <Typography>
                        Êtes-vous sûr de vouloir supprimer cet ami ?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button
                        onClick={() => selectedFriend && handleRemoveFriend(selectedFriend.id)}
                        color="error"
                    >
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FriendList; 
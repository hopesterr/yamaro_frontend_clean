import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AddFriend = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const config = await getAuthConfig();
            if (!config) return;

            // D'abord, rechercher l'utilisateur par email
            const searchResponse = await axios.get(`/api/users/search?email=${email}`, config);
            const userId = searchResponse.data.id;

            // Envoyer la demande d'ami
            await axios.post('/api/friends/request', { friendId: userId }, config);
            
            setSuccess('Demande d\'ami envoyée avec succès !');
            setEmail('');
        } catch (error: any) {
            if (error.response?.status === 401) {
                navigate('/login');
                return;
            }
            setError(
                error?.response?.data?.error ||
                'Une erreur est survenue lors de l\'envoi de la demande d\'ami'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, margin: '0 auto', p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Ajouter un ami
            </Typography>

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Email de l'ami"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    margin="normal"
                    disabled={loading}
                />

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mt: 2,
                            mb: 2,
                            color: 'error.main',
                            background: 'rgba(255,0,0,0.08)',
                            fontWeight: 500,
                            textAlign: 'center',
                            whiteSpace: 'pre-line',
                            maxWidth: 300,
                            mx: 'auto',
                            borderRadius: 2,
                            overflow: 'auto',
                            maxHeight: 80,
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        {success}
                    </Alert>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={loading}
                >
                    {loading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'Envoyer une demande d\'ami'
                    )}
                </Button>
            </form>
        </Box>
    );
};

export default AddFriend; 
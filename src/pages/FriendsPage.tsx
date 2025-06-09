
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import FriendList from '../components/Friends/FriendList';
import AddFriend from '../components/Friends/AddFriend';

const FriendsPage = () => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.default',
            }}
        >
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Gestion des Amis
                </Typography>
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2 }}>
                            <FriendList />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2 }}>
                            <AddFriend />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default FriendsPage; 
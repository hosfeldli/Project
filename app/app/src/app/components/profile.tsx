import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button, Avatar, Modal, Box, Typography, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

'use client';


interface User {
    id: string;
    name: string;
    email: string;
    picture: string;
    googleId: string;
}

const ProfileComponent = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Get token from localStorage - assuming you store the Google token there
            const token = localStorage.getItem('googleToken');
            
            if (!token) {
                setError('Not authenticated');
                setIsLoading(false);
                return;
            }
            
            const response = await fetch('/api/getuser', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            
            const data = await response.json();
            setUser(data.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (!user) {
            fetchUserData();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
    };

    return (
        <div>
            <Button 
                onClick={handleOpen} 
                sx={{ 
                    minWidth: 0, 
                    borderRadius: '50%', 
                    p: 1 
                }}
            >
                {user && user.picture ? (
                    <Avatar 
                        src={user.picture} 
                        alt={user.name}
                        sx={{ width: 40, height: 40 }}
                    />
                ) : (
                    <Avatar sx={{ width: 40, height: 40 }}>
                        <PersonIcon />
                    </Avatar>
                )}
            </Button>

            <Modal
                open={isOpen}
                onClose={handleClose}
                aria-labelledby="profile-modal"
                aria-describedby="user-profile-information"
            >
                <Box sx={modalStyle}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : user ? (
                        <Box sx={{ textAlign: 'center' }}>
                            {user.picture && (
                                <Avatar 
                                    src={user.picture}
                                    alt={user.name}
                                    sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                                />
                            )}
                            <Typography variant="h5" component="h2" gutterBottom>
                                {user.name}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                {user.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                User ID: {user.id}
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleClose}
                                sx={{ mt: 3 }}
                            >
                                Close
                            </Button>
                        </Box>
                    ) : (
                        <Typography>No user data available</Typography>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default ProfileComponent;</Typography></Box></Button>
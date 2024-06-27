import { Alert, Box, Button, Snackbar, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { API_URL } from '../common/constants';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const router = useRouter();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post(`${API_URL}/auth/login`, { username, password });
			const { token, role } = response.data;
			localStorage.setItem('authObj', JSON.stringify({ token, role }));
			if (role === 'admin') {
				router.push('/admin');
			} else if (role === 'user') {
				router.push('/user');
			}
		} catch (err) {
			const statusCode = err?.response?.status;
			if (statusCode === 401) {
				setErrorMessage(err?.response?.data?.message || 'Invalid credentials!');
				setOpen(true);
			} else {
				setErrorMessage('Server Error!');
				setOpen(true);
			}
		}
	};

	const handleBtnClick = async (e) => {
		e.preventDefault();
		router.push('/register');
	};

	const handleClose = (e, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setOpen(false);
	};

	return (
		<Box sx={{ p: 4 }}>
			<Typography variant="h4" gutterBottom>
				Login
			</Typography>
			<Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
				<TextField
					label="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					fullWidth
					required
					sx={{ mb: 2 }}
				/>
				<TextField
					label="Password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					fullWidth
					required
					sx={{ mb: 2 }}
				/>
				<Button type="submit" variant="contained" color="primary">
					Login
				</Button>
				<Button type="button" variant="contained" color="primary" sx={{ ml: 2 }} onClick={handleBtnClick}>
					Register
				</Button>
			</Box>
			<Snackbar
				open={open}
				autoHideDuration={6000}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
				<Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
					{errorMessage}
				</Alert>
			</Snackbar>
		</Box>
	);
}

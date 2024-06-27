import { Alert, Box, Button, FormControl, MenuItem, Snackbar, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { API_URL } from '../common/constants';

export default function RegistrationView() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [role, setRole] = useState('user');
	const router = useRouter();

	const handleRegister = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post(`${API_URL}/auth/register`, { username, password, role });
			if (response.data.status !== 409) {
				router.push('/login');
			}
			setErrorMessage(response.data.message);
			setOpen(true);
		} catch (err) {
			setErrorMessage('Server error!');
			setOpen(true);
		}
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
				Register
			</Typography>
			<Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
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
				<FormControl fullWidth required sx={{ mb: 2 }}>
					<TextField value={role} onChange={(e) => setRole(e.target.value)} select label="Role">
						<MenuItem value="user">User</MenuItem>
						<MenuItem value="admin">Admin</MenuItem>
					</TextField>
				</FormControl>
				<Button type="submit" variant="contained" color="primary">
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

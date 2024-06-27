import {
	Alert,
	Box,
	Button,
	Paper,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { API_URL, SERVER_URL } from '../common/constants';
import { formatDate } from '../common/utils';

export default function AdminPanel() {
	const [tenders, setTenders] = useState([]);
	const [severity, setSeverity] = useState('');
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const router = useRouter();
	const [newTender, setNewTender] = useState({ name: '', description: '', startTime: '', endTime: '', bufferTime: '' });
	const socket = io(SERVER_URL);
	useEffect(() => {
		const fetchData = async () => {
			const _localStorage = JSON.parse(localStorage.getItem('authObj'));
			const token = _localStorage?.token;
			const role = _localStorage?.role;
			if (!token || role !== 'admin') {
				router.push('/login');
			}
			try {
				const response = await axios.get(`${API_URL}/tenders`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				setTenders(response.data);
			} catch (err) {
				const statusCode = err?.response?.status;
				if (statusCode === 401) {
					router.push('/login');
				} else {
					setErrorMessage('Server error! Try refreshing the page');
					setSeverity('error');
					setOpen(true);
				}
			}
		};
		fetchData();
	}, []);

	const createTender = async (e) => {
		e.preventDefault();
		const _localStorage = JSON.parse(localStorage.getItem('authObj'));
		const token = _localStorage?.token;
		try {
			const response = await axios.post(`${API_URL}/tenders`, newTender, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setTenders([...tenders, response.data]);
			setNewTender({ name: '', description: '', startTime: '', endTime: '', bufferTime: '' });
			setErrorMessage('Tender Created successfully');
			setSeverity('success');
			setOpen(true);
			socket.emit('tenderCreated', JSON.stringify([...tenders, response.data]));
		} catch (err) {
			setErrorMessage('Error orrcured');
			setSeverity('error');
			setOpen(true);
		}
	};

	const handleClose = (e, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setOpen(false);
	};

	const clickHndl = () => {
		// socket.emit('tenderCreated', 'tenders');
	};
	return (
		<Box sx={{ p: 4 }}>
			<Typography variant="h4" gutterBottom>
				Admin Panel
			</Typography>
			<Box component="form" onSubmit={createTender} sx={{ mb: 4 }}>
				<Typography variant="h6">Create New Tender</Typography>
				<TextField
					label="Name"
					value={newTender.name}
					onChange={(e) => setNewTender({ ...newTender, name: e.target.value })}
					fullWidth
					required
					sx={{ mb: 2 }}
				/>
				<TextField
					label="Description"
					value={newTender.description}
					onChange={(e) => setNewTender({ ...newTender, description: e.target.value })}
					fullWidth
					required
					sx={{ mb: 2 }}
				/>
				<TextField
					label="Start Time"
					type="datetime-local"
					value={newTender.startTime}
					onChange={(e) => setNewTender({ ...newTender, startTime: e.target.value })}
					fullWidth
					required
					sx={{ mb: 2 }}
					InputLabelProps={{ shrink: true }}
				/>
				<TextField
					label="End Time"
					type="datetime-local"
					value={newTender.endTime}
					onChange={(e) => setNewTender({ ...newTender, endTime: e.target.value })}
					fullWidth
					required
					sx={{ mb: 2 }}
					InputLabelProps={{ shrink: true }}
				/>
				<TextField
					label="Buffer Time (minutes)"
					type="number"
					value={newTender.bufferTime}
					onChange={(e) => setNewTender({ ...newTender, bufferTime: e.target.value })}
					fullWidth
					required
					sx={{ mb: 2 }}
				/>
				<Button type="submit" variant="contained" color="primary">
					Create Tender
				</Button>
			</Box>
			<Button type="button" variant="contained" color="primary" onClick={clickHndl}>
				Tender
			</Button>
			<Box>
				<Typography variant="h6">Previous Tenders</Typography>
				<Paper sx={{ width: '100%', overflow: 'hidden' }}>
					<TableContainer sx={{ maxHeight: 440 }}>
						<Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell>Name</TableCell>
									<TableCell align="center">Description</TableCell>
									<TableCell align="center">Start Date</TableCell>
									<TableCell align="center">End Date</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{tenders.length > 0 ? (
									tenders.map((tender) => (
										<TableRow key={tender._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
											<TableCell>{tender.name}</TableCell>
											<TableCell align="center">{tender.description}</TableCell>
											<TableCell align="center">{formatDate(tender.startTime)}</TableCell>
											<TableCell align="center">{formatDate(tender.endTime)}</TableCell>
										</TableRow>
									))
								) : (
									<TableRow key="No Tender" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell align="center" colSpan={4}>
											No Tender
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
			</Box>
			<Snackbar
				open={open}
				autoHideDuration={3000}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
				<Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
					{errorMessage}
				</Alert>
			</Snackbar>
		</Box>
	);
}

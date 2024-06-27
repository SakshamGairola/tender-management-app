import {
	Alert,
	Box,
	Button,
	FormControl,
	MenuItem,
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

export default function UserView() {
	const [tenders, setTenders] = useState([]);
	const [selectedTender, setSelectedTender] = useState(null);
	const [severity, setSeverity] = useState('');
	const [open, setOpen] = useState(false);
	const [updateBids, setUpdateBids] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [bid, setBid] = useState({ tenderId: '', companyName: '', bidCost: '' });
	const [bids, setBids] = useState([]);
	const router = useRouter();
	const socket = io(SERVER_URL);

	useEffect(() => {
		const fetchData = async () => {
			const _localStorage = JSON.parse(localStorage.getItem('authObj'));
			const token = _localStorage?.token;
			const role = _localStorage?.role;
			if (!token || role !== 'user') {
				router.push('/login');
			}
			try {
				const response = await axios.get(`${API_URL}/tenders/available`, {
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
			return () => {
				socket.disconnect();
			};
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (selectedTender) {
			const performUpdate = async () => {
				const _localStorage = JSON.parse(localStorage.getItem('authObj'));
				const token = _localStorage?.token;
				const response = await axios.post(
					`${API_URL}/bids/byTender`,
					{ tenderId: selectedTender._id },
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				setBids(response.data);
			};
			performUpdate();
		}
	}, [updateBids]);

	useEffect(() => {
		socket.on('updateTenders', async () => {
			const _localStorage = JSON.parse(localStorage.getItem('authObj'));
			const token = _localStorage?.token;
			const response = await axios.get(`${API_URL}/tenders/available`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setTenders(response.data);
		});
		socket.on('newBidAdded', async (tenderId) => {
			if (selectedTender._id === tenderId) {
				setUpdateBids((prev) => !prev);
			}
		});
		// Remove event listener on component unmount
		return () => socket.off('updateTenders');
	}, [socket, tenders]);

	const submitBid = async (e) => {
		e.preventDefault();
		const _localStorage = JSON.parse(localStorage.getItem('authObj'));
		const token = _localStorage?.token;
		try {
			await axios.post(`${API_URL}/bids`, bid, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const response = await axios.post(
				`${API_URL}/bids/byTender`,
				{ tenderId: selectedTender._id },
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			setErrorMessage('Bid successfully submitted');
			setSeverity('success');
			setOpen(true);
			setBids(response.data);
			socket.emit('newBidAdded', selectedTender._id);
		} catch (err) {
			setErrorMessage('Some error occured!');
			setSeverity('error');
			setOpen(true);
		}
	};

	const handleTenderSelect = async (tender) => {
		const _localStorage = JSON.parse(localStorage.getItem('authObj'));
		const token = _localStorage?.token;
		const response = await axios.post(
			`${API_URL}/bids/byTender`,
			{ tenderId: tender._id },
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		setBids(response.data);
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
				Available Tenders
			</Typography>
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
			<Box component="form" onSubmit={submitBid} sx={{ mt: 4 }}>
				<Typography variant="h6">Submit Quotation</Typography>
				<FormControl fullWidth required sx={{ mb: 2 }}>
					<TextField
						value={bid.tenderId}
						onChange={(e) => setBid({ ...bid, tenderId: e.target.value })}
						select
						label="Tender">
						<MenuItem value="">
							<em>None</em>
						</MenuItem>
						{tenders.map((tender) => (
							<MenuItem
								key={tender._id}
								value={tender._id}
								onClick={(e) => {
									setSelectedTender(tender);
									handleTenderSelect(tender);
								}}>
								{tender.name}
							</MenuItem>
						))}
					</TextField>
				</FormControl>
				<TextField
					label="Company Name"
					value={bid.companyName}
					onChange={(e) => setBid({ ...bid, companyName: e.target.value })}
					fullWidth
					required
					sx={{ mb: 2 }}
				/>
				<TextField
					label="Bid Cost"
					type="number"
					value={bid.bidCost}
					onChange={(e) => setBid({ ...bid, bidCost: e.target.value })}
					fullWidth
					required
					sx={{ mb: 2 }}
				/>
				<Button type="submit" variant="contained" color="primary">
					Submit Bid
				</Button>
			</Box>
			<Box sx={{ mt: 4 }}>
				<Typography variant="h6" sx={{ mb: 2 }}>
					Bids for Tender: {selectedTender?.name ?? ''}
				</Typography>
				<Paper sx={{ width: '100%', overflow: 'hidden' }}>
					<TableContainer sx={{ maxHeight: 440 }}>
						<Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell>Company Name</TableCell>
									<TableCell align="center">Bid Time</TableCell>
									<TableCell align="center">Bid Cost</TableCell>
									<TableCell align="center">Late Bid</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{bids.length > 0 ? (
									bids.map((bid) => (
										<TableRow key={bid._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
											<TableCell>{bid.companyName}</TableCell>
											<TableCell align="center">{formatDate(bid.bidTime)}</TableCell>
											<TableCell align="center">{bid.bidCost}</TableCell>
											<TableCell align="center">{bid.isLate ? 'Yes' : 'No'}</TableCell>
										</TableRow>
									))
								) : (
									<TableRow key="No Tender" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell align="center" colSpan={4}>
											Select a Tender
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
				autoHideDuration={6000}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
				<Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
					{errorMessage}
				</Alert>
			</Snackbar>
		</Box>
	);
}

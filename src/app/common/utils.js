import { months } from './constants';

const formatDate = (inputDate) => {
	const date = new Date(inputDate);
	const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${
		months[date.getMonth()]
	}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date
		.getMinutes()
		.toString()
		.padStart(2, '0')}`;
	return formattedDate;
};

export { formatDate };

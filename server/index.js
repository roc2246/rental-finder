import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './models/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => res.send('Rental Finder API'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

async function start() {
	await connectDB();
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}

start().catch((err) => {
	console.error('Failed to start server:', err);
	process.exit(1);
});


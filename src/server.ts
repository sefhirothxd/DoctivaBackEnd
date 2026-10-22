import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import { db } from './config/db';
import apiRoutes from './routes';

async function connectToDatabase() {
	try {
		await db.authenticate();
		db.sync();
		console.log(colors.green('Connection has been established successfully.'));
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
}
connectToDatabase();

const app = express();

app.use(morgan('dev'));

app.use(express.json());
// Endpoints principales
app.use('/api', apiRoutes);

export default app;

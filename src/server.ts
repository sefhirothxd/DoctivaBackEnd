import express from 'express';
import cors from 'cors'; // <-- 1. Importa cors
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

// 2. Configura los orígenes permitidos para CORS
const allowedOrigins = [
	'https://doctiva.vercel.app', // Tu frontend en producción
	'http://localhost:5173', // Vite local por defecto
	'http://localhost:3000', // Otro puerto local común
];

app.use(
	cors({
		origin: function (origin, callback) {
			// Permite solicitudes sin origen (como Thunder Client, Postman o apps móviles)
			if (!origin || allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error('Bloqueado por la política CORS'));
			}
		},
		credentials: true,
	})
);

app.use(morgan('dev'));

app.use(express.json());
// Endpoints principales
app.use('/api', apiRoutes);

export default app;

import express from 'express';
import cors from 'cors'; // <-- 1. Importa cors
import colors from 'colors';
import morgan from 'morgan';
import { db } from './config/db';
import apiRoutes from './routes';

async function connectToDatabase() {
	try {
		await db.authenticate();
		await db.sync();
		// sync() no altera tablas existentes: añade la columna de orden si falta
		await db.query(
			'ALTER TABLE recursos_curso ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0'
		);
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
		origin: '*',
		credentials: true,
	})
);

app.use(morgan('dev'));

app.use(express.json());

const healthCheck = async (_req: express.Request, res: express.Response) => {
	try {
		await db.authenticate();
		res.status(200).json({
			status: 'ok',
			message: 'La API está activa y la base de datos está conectada.',
			timestamp: new Date().toISOString(),
		});
	} catch {
		res.status(503).json({
			status: 'error',
			message: 'La API está activa, pero no se puede conectar a la base de datos.',
			timestamp: new Date().toISOString(),
		});
	}
};

app.get('/', healthCheck);
app.get('/health', healthCheck);

// Endpoints principales
app.use('/api', apiRoutes);

export default app;

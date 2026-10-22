import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
dotenv.config();
// 1. Importa tus modelos explícitamente
import { Usuario } from '../models/Usuario';
import { Estudiante } from '../models/Estudiante';
import { Curso } from '../models/Curso';
import { Inscripcion } from '../models/Inscripcion';
import { Recurso } from '../models/Recurso';
import { RecursoCurso } from '../models/RecursoCurso';

export const db = new Sequelize(process.env.DATABASE_URL!, {
	// 2. Pásalos como un array limpio (esto evita que falle en Railway)
	models: [Usuario, Estudiante, Curso, Inscripcion, Recurso, RecursoCurso],
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	},
	logging: false, // Opcional para limpiar la consola en producción
});

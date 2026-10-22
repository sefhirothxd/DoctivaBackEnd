import { Request, Response } from 'express';
import { Inscripcion } from '../models/Inscripcion';
import { Estudiante } from '../models/Estudiante';
import { Curso } from '../models/Curso';

export const obtenerInscripciones = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const inscripciones = await Inscripcion.findAll({
			include: [Estudiante, Curso],
		});
		res.status(200).json(inscripciones);
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al obtener inscripciones', error });
	}
};

export const matricularEstudiante = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { estudiante_id, curso_ids } = req.body;

		if (!estudiante_id || !Array.isArray(curso_ids)) {
			res.status(400).json({
				mensaje: 'El estudiante_id y un arreglo curso_ids son obligatorios',
			});
			return;
		}

		// Procesa cada curso asegurando que no se dupliquen inscripciones
		const promesas = curso_ids.map(async (curso_id) => {
			const [inscripcion] = await Inscripcion.findOrCreate({
				where: { estudiante_id, curso_id },
				defaults: { estado_curso: 'activo' },
			});
			return inscripcion;
		});

		const inscripcionesCreadas = await Promise.all(promesas);

		res.status(201).json({
			mensaje: 'Matrículas procesadas exitosamente',
			inscripciones: inscripcionesCreadas,
		});
	} catch (error) {
		res.status(500).json({
			mensaje: 'Error al procesar las matrículas',
			error,
		});
	}
};

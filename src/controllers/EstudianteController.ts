import { Request, Response } from 'express';
import { Estudiante } from '../models/Estudiante';
import { Usuario } from '../models/Usuario';
import { Inscripcion } from '../models/Inscripcion';
import { Curso } from '../models/Curso';

export const obtenerEstudiantes = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const estudiantes = await Estudiante.findAll({
			include: [
				{
					model: Usuario,
					attributes: { exclude: ['password_hash'] },
				},
				{
					model: Inscripcion,
					include: [Curso],
				},
			],
		});
		res.status(200).json(estudiantes);
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al obtener estudiantes', error });
	}
};

export const obtenerEstudiantePorId = async (
	req: Request<{ id: string }>,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const estudiante = await Estudiante.findByPk(id, {
			include: [
				{
					model: Usuario,
					attributes: { exclude: ['password_hash'] },
				},
				{
					model: Inscripcion,
					include: [Curso],
				},
			],
		});

		if (!estudiante) {
			res.status(404).json({ mensaje: 'Estudiante no encontrado' });
			return;
		}

		res.status(200).json(estudiante);
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al obtener estudiante', error });
	}
};

export const crearEstudiante = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const nuevoEstudiante = await Estudiante.create(req.body);
		res.status(201).json(nuevoEstudiante);
	} catch (error) {
		res.status(400).json({ mensaje: 'Error al crear estudiante', error });
	}
};

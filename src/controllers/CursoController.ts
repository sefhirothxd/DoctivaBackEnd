import { Request, Response } from 'express';
import { Curso } from '../models/Curso';
import { Recurso } from '../models/Recurso';

export const obtenerCursos = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const cursos = await Curso.findAll({
			include: [Recurso],
		});
		res.status(200).json(cursos);
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al obtener cursos', error });
	}
};

export const obtenerCursoPorId = async (
	req: Request<{ id: string }>,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const curso = await Curso.findByPk(id, {
			include: [Recurso],
		});

		if (!curso) {
			res.status(404).json({ mensaje: 'Curso no encontrado' });
			return;
		}

		res.status(200).json(curso);
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al obtener curso', error });
	}
};

export const crearCurso = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const nuevoCurso = await Curso.create(req.body);
		res.status(201).json(nuevoCurso);
	} catch (error) {
		res.status(400).json({ mensaje: 'Error al crear curso', error });
	}
};

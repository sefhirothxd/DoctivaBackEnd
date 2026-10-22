import { Request, Response } from 'express';
import { Recurso } from '../models/Recurso';
import { Curso } from '../models/Curso';

export const obtenerRecursos = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const recursos = await Recurso.findAll({
			include: [Curso],
		});
		res.status(200).json(recursos);
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al obtener recursos', error });
	}
};

export const crearRecurso = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const nuevoRecurso = await Recurso.create(req.body);
		res.status(201).json(nuevoRecurso);
	} catch (error) {
		res.status(400).json({ mensaje: 'Error al crear recurso', error });
	}
};

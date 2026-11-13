import { Request, Response } from 'express';
import { Curso } from '../models/Curso';
import { Recurso } from '../models/Recurso';
import { RecursoCurso } from '../models/RecursoCurso';
import { db } from '../config/db';

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

/**
 * REORDENAR RECURSOS: recibe { ids } con los ids de recurso del curso en el orden deseado
 * y guarda orden = índice en la tabla puente, en una transacción.
 */
export const reordenarRecursos = async (
	req: Request<{ id: string }>,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const ids: unknown = req.body?.ids;

		if (
			!Array.isArray(ids) ||
			ids.some((v) => typeof v !== 'string') ||
			new Set(ids).size !== ids.length
		) {
			res.status(400).json({ mensaje: 'ids debe ser un arreglo de ids únicos' });
			return;
		}
		const lista = ids as string[];

		const curso = await Curso.findByPk(id);
		if (!curso) {
			res.status(404).json({ mensaje: 'Curso no encontrado' });
			return;
		}

		const asignados = await RecursoCurso.findAll({ where: { curso_id: id } });
		const idsCurso = new Set(asignados.map((a) => a.recurso_id));
		if (lista.some((rid) => !idsCurso.has(rid))) {
			res
				.status(400)
				.json({ mensaje: 'Algún recurso no pertenece a este curso' });
			return;
		}

		await db.transaction(async (transaction) => {
			for (const [indice, recursoId] of lista.entries()) {
				await RecursoCurso.update(
					{ orden: indice },
					{ where: { curso_id: id, recurso_id: recursoId }, transaction }
				);
			}
		});

		res.status(204).send();
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al reordenar recursos', error });
	}
};

import { Request, Response } from 'express';
import { Recurso } from '../models/Recurso';
import { Curso } from '../models/Curso';
import { Op } from 'sequelize';

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
		console.log('crearRecurso body:', req.body);
		const {
			assignedCourseIds,
			curso_ids,
			curso_id,
			cursoId,
			cursos,
			curso,
			curso_codigo,
			cursoCodigo,
			codigo_curso,
			...datos
		} = req.body ?? {};

		// Acepta id (UUID) o código de curso, único o en array, o como objeto {id|codigo}
		const aLista = (v: unknown): unknown[] => (Array.isArray(v) ? v : [v]);
		const crudos = [
			assignedCourseIds,
			curso_ids,
			cursos,
			curso_id,
			cursoId,
			curso,
			curso_codigo,
			cursoCodigo,
			codigo_curso,
		]
			.flatMap(aLista)
			.filter(Boolean)
			.map((c) =>
				typeof c === 'object'
					? String(
							(c as { id?: string; codigo?: string }).id ??
								(c as { codigo?: string }).codigo
						)
					: String(c)
			);
		const refs = [...new Set(crudos)];
		const esUuid = (s: string) =>
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
		const ids = refs.filter(esUuid);
		const codigos = refs.filter((r) => !esUuid(r));

		const nuevoRecurso = await Recurso.create(datos);

		if (refs.length > 0) {
			const encontrados = await Curso.findAll({
				where: {
					[Op.or]: [
						...(ids.length ? [{ id: ids }] : []),
						...(codigos.length ? [{ codigo: codigos }] : []),
					],
				},
			});
			const faltan = refs.filter(
				(r) => !encontrados.some((c) => c.id === r || c.codigo === r)
			);
			console.log('crearRecurso refs:', refs, 'faltan:', faltan);
			if (faltan.length > 0) {
				await nuevoRecurso.destroy();
				res.status(400).json({ mensaje: 'Uno o más cursos no existen' });
				return;
			}
			await nuevoRecurso.$set('cursos', encontrados);
		}

		const recurso = await Recurso.findByPk(nuevoRecurso.id, {
			include: [Curso],
		});
		res.status(201).json(recurso);
	} catch (error) {
		res.status(400).json({ mensaje: 'Error al crear recurso', error });
	}
};

/**
 * ELIMINAR RECURSO: borra el recurso por id y sus asignaciones a cursos (recursos_curso).
 */
export const eliminarRecurso = async (
	req: Request<{ id: string }>,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		const recurso = await Recurso.findByPk(id);
		if (!recurso) {
			res.status(404).json({ mensaje: 'Recurso no encontrado' });
			return;
		}

		// Limpia la tabla puente antes para evitar error de FK
		await recurso.$set('cursos', []);
		await recurso.destroy();

		res.status(200).json({ mensaje: 'Recurso eliminado exitosamente.' });
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al eliminar recurso', error });
	}
};

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Estudiante } from '../models/Estudiante';
import { Usuario } from '../models/Usuario';
import { Inscripcion } from '../models/Inscripcion';
import { Curso } from '../models/Curso';
import { Op } from 'sequelize';

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
					where: { estado_curso: { [Op.ne]: 'retirado' } },
					required: false,
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
					where: { estado_curso: { [Op.ne]: 'retirado' } },
					required: false,
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

/**
 * CREAR ESTUDIANTE: Crea primero el registro en Usuario (con bcrypt) y luego en Estudiante.
 * Opcionalmente puede recibir courseId para matricularlo de inmediato.
 */
export const crearEstudiante = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { nombres, apellidos, email, telefono, password, courseId } =
			req.body;

		console.log('Datos recibidos para crear estudiante:', {
			nombres,
			apellidos,
			email,
			telefono,
			password,
			courseId,
		});

		if (!email || !password || !nombres || !apellidos) {
			res.status(400).json({
				mensaje:
					'Faltan campos obligatorios (nombres, apellidos, email, password).',
			});
			return;
		}

		// Verificar si el usuario ya existe
		const usuarioExistente = await Usuario.findOne({ where: { email } });
		if (usuarioExistente) {
			res
				.status(400)
				.json({ mensaje: 'El correo electrónico ya está registrado.' });
			return;
		}

		// Hashear contraseña
		const salt = await bcrypt.genSalt(10);
		const password_hash = await bcrypt.hash(password, salt);

		// Crear usuario asociado
		const nuevoUsuario = await Usuario.create({
			email,
			password_hash,
			rol: 'estudiante',
			estado: 'Activo',
		});

		// Crear estudiante asociado
		const nuevoEstudiante = await Estudiante.create({
			usuario_id: nuevoUsuario.id,
			nombres: nombres,
			apellidos: apellidos,
			telefono: telefono || '',
		});

		// Si se envió un curso inicial, crear la inscripción
		if (courseId) {
			await Inscripcion.create({
				estudiante_id: nuevoEstudiante.id,
				curso_id: courseId,
				estado_curso: 'activo',
			});
		}

		// Obtener el estudiante con sus relaciones completas para la respuesta
		const estudianteCompleto = await Estudiante.findByPk(nuevoEstudiante.id, {
			include: [
				{ model: Usuario, attributes: { exclude: ['password_hash'] } },
				{
					model: Inscripcion,
					where: { estado_curso: { [Op.ne]: 'retirado' } },
					required: false,
					include: [Curso],
				},
			],
		});

		res.status(201).json(estudianteCompleto);
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al crear estudiante', error });
	}
};

/**
 * EDITAR ESTUDIANTE: Actualiza datos personales y opcionalmente el correo o curso.
 */
export const actualizarEstudiante = async (
	req: Request<{ id: string }>,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const body = req.body;
		// El front envía nombres/apellidos/telefono; se aceptan alias firstName/lastName/phone
		const firstName = body.nombres ?? body.firstName;
		const lastName = body.apellidos ?? body.lastName;
		const phone = body.telefono ?? body.phone;
		const { email, status, password, courseId, courseIds } = body;

		const estudiante = await Estudiante.findByPk(id, {
			include: [Usuario],
		});

		if (!estudiante) {
			res.status(404).json({ mensaje: 'Estudiante no encontrado' });
			return;
		}

		// 1. Actualizar datos personales del estudiante
		await estudiante.update({
			nombres: firstName ?? estudiante.nombres,
			apellidos: lastName ?? estudiante.apellidos,
			telefono: phone ?? estudiante.telefono,
		});

		// 2. Actualizar datos del usuario asociado (email, estado y opcionalmente password)
		// Actualizar datos del usuario asociado (email, estado)
		if (estudiante.usuario_id) {
			const usuario = await Usuario.findByPk(estudiante.usuario_id);
			if (usuario) {
				// Normalizamos el estado para que la primera letra sea mayúscula (Ej: "activo" -> "Activo")
				let estadoNormalizado = usuario.estado;
				if (status) {
					const lower = status.toLowerCase();
					estadoNormalizado = lower === 'activo' ? 'Activo' : 'Inactivo';
				}

				const updateData: any = {
					email: email ?? usuario.email,
					estado: estadoNormalizado,
				};

				// Si se envió una nueva contraseña, la hasheamos
				if (password && password.trim() !== '') {
					const salt = await bcrypt.genSalt(10);
					updateData.password_hash = await bcrypt.hash(password.trim(), salt);
				}

				await usuario.update(updateData);
			}
		}
		// 3. Sincronizar cursos inscritos si se envía courseIds
		if (Array.isArray(courseIds)) {
			const deseados = new Set<string>(courseIds);
			const existentes = await Inscripcion.findAll({
				where: { estudiante_id: estudiante.id },
			});
			const existentesPorCurso = new Map(
				existentes.map((i) => [i.curso_id, i])
			);

			// Crear o reactivar
			for (const cursoId of deseados) {
				const insc = existentesPorCurso.get(cursoId);
				if (!insc) {
					await Inscripcion.create({
						estudiante_id: estudiante.id,
						curso_id: cursoId,
						estado_curso: 'activo',
					});
				} else if (insc.estado_curso === 'retirado') {
					await insc.update({ estado_curso: 'activo' });
				}
			}

			// Los que ya no están: marcar como retirado (conserva historial)
			for (const insc of existentes) {
				if (!deseados.has(insc.curso_id) && insc.estado_curso !== 'retirado') {
					await insc.update({ estado_curso: 'retirado' });
				}
			}
		} else if (courseId) {
			// Manejo opcional de un solo curso
			const inscripcionExistente = await Inscripcion.findOne({
				where: { estudiante_id: estudiante.id, curso_id: courseId },
			});
			if (!inscripcionExistente) {
				await Inscripcion.create({
					estudiante_id: estudiante.id,
					curso_id: courseId,
					estado_curso: 'activo',
				});
			}
		}

		const estudianteActualizado = await Estudiante.findByPk(id, {
			include: [
				{ model: Usuario, attributes: { exclude: ['password_hash'] } },
				{
					model: Inscripcion,
					where: { estado_curso: { [Op.ne]: 'retirado' } },
					required: false,
					include: [Curso],
				},
			],
		});

		res.status(200).json(estudianteActualizado);
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al actualizar estudiante', error });
	}
};
/**
 * CAMBIAR CONTRASEÑA: Actualiza el hash de la contraseña del usuario vinculado.
 */
export const cambiarPasswordEstudiante = async (
	req: Request<{ id: string }>,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const { password } = req.body;

		if (!password) {
			res.status(400).json({ mensaje: 'La nueva contraseña es obligatoria.' });
			return;
		}

		const estudiante = await Estudiante.findByPk(id);
		if (!estudiante) {
			res.status(404).json({ mensaje: 'Estudiante no encontrado' });
			return;
		}

		const usuario = await Usuario.findByPk(estudiante.usuario_id);
		if (!usuario) {
			res.status(404).json({ mensaje: 'Usuario asociado no encontrado' });
			return;
		}

		const salt = await bcrypt.genSalt(10);
		const password_hash = await bcrypt.hash(password, salt);

		await usuario.update({ password_hash });

		res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente.' });
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al cambiar la contraseña', error });
	}
};

/**
 * ELIMINAR (CAMBIO DE ESTADO): Cambia el estado del usuario asociado a 'inactivo'
 * en lugar de borrar el registro físicamente de la base de datos.
 */
export const eliminarEstudiante = async (
	req: Request<{ id: string }>,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		const estudiante = await Estudiante.findByPk(id);
		if (!estudiante) {
			res.status(404).json({ mensaje: 'Estudiante no encontrado' });
			return;
		}

		// Realizamos el cambio de estado en el modelo Usuario vinculado
		const usuario = await Usuario.findByPk(estudiante.usuario_id);
		if (usuario) {
			await usuario.update({ estado: 'inactivo' });
		}

		res.status(200).json({ mensaje: 'Estudiante desactivado exitosamente.' });
	} catch (error) {
		res
			.status(500)
			.json({ mensaje: 'Error al cambiar el estado del estudiante', error });
	}
};

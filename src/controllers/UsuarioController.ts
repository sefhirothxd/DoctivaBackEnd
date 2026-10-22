import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // 1. Importar jsonwebtoken
import { db } from '../config/db';
import { Usuario } from '../models/Usuario';
import { Estudiante } from '../models/Estudiante';

export const registrarEstudiante = async (
	req: Request,

	res: Response
): Promise<void> => {
	// Iniciar una transacción para asegurar consistencia

	const t = await db.transaction();

	try {
		const { email, password, nombres, apellidos, telefono } = req.body;

		// 1. Validaciones básicas

		if (!email || !password || !nombres || !apellidos) {
			await t.rollback();

			res.status(400).json({
				mensaje: 'Email, contraseña, nombres y apellidos son obligatorios',
			});

			return;
		}

		// 2. Verificar que el correo no esté ocupado

		const usuarioExistente = await Usuario.findOne({
			where: { email },

			transaction: t,
		});

		if (usuarioExistente) {
			await t.rollback();

			res

				.status(409)

				.json({ mensaje: 'El correo electrónico ya se encuentra registrado' });

			return;
		}

		// 3. Hashear la contraseña

		const salt = await bcrypt.genSalt(10);

		const password_hash = await bcrypt.hash(password, salt);

		// 4. Crear la cuenta en la tabla 'usuarios'

		const nuevoUsuario = await Usuario.create(
			{
				email,

				password_hash,

				rol: 'estudiante',

				estado: 'Activo',
			},

			{ transaction: t }
		);

		// 5. Crear el perfil en la tabla 'estudiantes' vinculando usuario_id

		const nuevoEstudiante = await Estudiante.create(
			{
				usuario_id: nuevoUsuario.id,

				nombres,

				apellidos,

				telefono,
			},

			{ transaction: t }
		);

		// Si todo fue exitoso, consolidar los cambios en la BD

		await t.commit();

		// 6. Preparar respuesta segura (sin hash)

		res.status(201).json({
			mensaje: 'Estudiante registrado exitosamente',

			estudiante: {
				id: nuevoEstudiante.id,

				usuario_id: nuevoUsuario.id,

				nombres: nuevoEstudiante.nombres,

				apellidos: nuevoEstudiante.apellidos,

				telefono: nuevoEstudiante.telefono,

				email: nuevoUsuario.email,

				rol: nuevoUsuario.rol,

				estado: nuevoUsuario.estado,

				creado_en: nuevoEstudiante.creado_en,
			},
		});
	} catch (error) {
		// Si ocurre un error, revertir cualquier cambio

		await t.rollback();

		res.status(500).json({ mensaje: 'Error al registrar estudiante', error });
	}
};

export const loginUsuario = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { email, password } = req.body;

		// 1. Validar que se envíen ambos campos
		if (!email || !password) {
			res
				.status(400)
				.json({ mensaje: 'El correo y la contraseña son requeridos' });
			return;
		}

		// 2. Buscar al usuario por correo, incluyendo su perfil de estudiante
		const usuario = await Usuario.findOne({
			where: { email },
			include: [Estudiante],
		});

		if (!usuario) {
			res.status(401).json({ mensaje: 'Credenciales inválidas' });
			return;
		}

		// 3. Validar si la cuenta está activa
		if (usuario.estado !== 'Activo') {
			res.status(403).json({ mensaje: 'La cuenta no se encuentra activa' });
			return;
		}

		// 4. Comparar la contraseña ingresada con el hash almacenado
		const passwordCorrecta = await bcrypt.compare(
			password,
			usuario.password_hash
		);
		if (!passwordCorrecta) {
			res.status(401).json({ mensaje: 'Credenciales inválidas' });
			return;
		}

		// 5. Actualizar la fecha del último acceso
		await usuario.update({ ultimo_acceso: new Date() });

		// 6. Generar el Token JWT
		// Asegúrate de tener una variable de entorno JWT_SECRET configurada en tu archivo .env
		const secretKey = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

		const token = jwt.sign(
			{
				id: usuario.id,
				email: usuario.email,
				rol: usuario.rol,
			},
			secretKey,
			{ expiresIn: '8h' } // Duración del token (ej. 8 horas, 1d, etc.)
		);

		// 7. Preparar la respuesta eliminando el password_hash
		const datosUsuario = usuario.toJSON();
		delete (datosUsuario as any).password_hash;

		// 8. Enviar la respuesta con el usuario y el token
		res.status(200).json({
			mensaje: 'Inicio de sesión exitoso',
			token, // <-- Aquí va el token incluido
			usuario: datosUsuario,
		});
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al iniciar sesión', error });
	}
};

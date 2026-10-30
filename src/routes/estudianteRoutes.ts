import { Router } from 'express';
import {
	obtenerEstudiantes,
	obtenerEstudiantePorId,
	crearEstudiante,
	actualizarEstudiante, // <-- 1. Importa actualizar
	cambiarPasswordEstudiante, // <-- 2. Importa cambiar contraseña
	eliminarEstudiante, // <-- 3. Importa cambiar estado (eliminar)
} from '../controllers/EstudianteController';

const router = Router();

// Rutas GET y POST existentes
router.get('/', obtenerEstudiantes);
router.get('/:id', obtenerEstudiantePorId);
router.post('/', crearEstudiante);

// Nuevas Rutas añadidas para completar el CRUD:
router.put('/:id', actualizarEstudiante); // Para editar datos del alumno y estado
router.put('/:id/password', cambiarPasswordEstudiante); // Para cambiar la contraseña del alumno
router.delete('/:id', eliminarEstudiante); // Para realizar la baja lógica (cambiar a inactivo)

export default router;

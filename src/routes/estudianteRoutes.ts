import { Router } from 'express';
import {
	obtenerEstudiantes,
	obtenerEstudiantePorId,
	crearEstudiante,
} from '../controllers/EstudianteController';

const router = Router();

router.get('/', obtenerEstudiantes);
router.get('/:id', obtenerEstudiantePorId);
router.post('/', crearEstudiante);

export default router;

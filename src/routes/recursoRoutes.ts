import { Router } from 'express';
import {
	obtenerRecursos,
	crearRecurso,
	eliminarRecurso,
} from '../controllers/RecursoController';

const router = Router();

router.get('/', obtenerRecursos);
router.post('/', crearRecurso);
router.delete('/:id', eliminarRecurso);

export default router;

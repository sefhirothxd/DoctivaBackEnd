import { Router } from 'express';
import {
	obtenerRecursos,
	crearRecurso,
} from '../controllers/RecursoController';

const router = Router();

router.get('/', obtenerRecursos);
router.post('/', crearRecurso);

export default router;

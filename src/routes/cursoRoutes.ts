import { Router } from 'express';
import {
	obtenerCursos,
	obtenerCursoPorId,
	crearCurso,
	reordenarRecursos,
} from '../controllers/CursoController';

const router = Router();

router.get('/', obtenerCursos);
router.get('/:id', obtenerCursoPorId);
router.post('/', crearCurso);
router.put('/:id/recursos/orden', reordenarRecursos);

export default router;

import { Router } from 'express';
import {
	obtenerCursos,
	obtenerCursoPorId,
	crearCurso,
} from '../controllers/CursoController';

const router = Router();

router.get('/', obtenerCursos);
router.get('/:id', obtenerCursoPorId);
router.post('/', crearCurso);

export default router;

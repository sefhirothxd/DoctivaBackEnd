import { Router } from 'express';
import {
	obtenerInscripciones,
	matricularEstudiante,
} from '../controllers/InscripcionController';

const router = Router();

router.get('/', obtenerInscripciones);
router.post('/', matricularEstudiante);

export default router;

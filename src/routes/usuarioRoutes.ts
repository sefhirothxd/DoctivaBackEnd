import { Router } from 'express';
import {
	loginUsuario,
	registrarEstudiante,
} from '../controllers/UsuarioController';

const router = Router();

router.post('/registro-estudiante', registrarEstudiante);
router.post('/login', loginUsuario);

export default router;

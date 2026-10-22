import { Router } from 'express';
import cursoRoutes from './cursoRoutes';
import estudianteRoutes from './estudianteRoutes';
import inscripcionRoutes from './inscripcionRoutes';
import recursoRoutes from './recursoRoutes';
import usuarioRoutes from './usuarioRoutes';

const router = Router();

router.use('/cursos', cursoRoutes);
router.use('/estudiantes', estudianteRoutes);
router.use('/inscripciones', inscripcionRoutes);
router.use('/recursos', recursoRoutes);
router.use('/usuarios', usuarioRoutes);

export default router;

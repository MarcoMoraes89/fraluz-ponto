import express from 'express';
import { cadastrarCurso, listarCursos, excluirCurso } from '../controller/cursosController.js';

const router = express.Router();

router.post('/cadastrar', cadastrarCurso);
router.get('/listar', listarCursos);
router.delete('/:id', excluirCurso);

export default router;
// routes/routes_atividades.js
const express = require('express');
const router = express.Router();

// 🚨 CORREÇÃO CRÍTICA DO CAMINHO:
// O caminho deve ser '../' para subir da pasta 'routes' e entrar na pasta 'controllers'.
const atividadesController = require('../controllers/atividadesController');

// ------------------------------
// ROTAS ATIVIDADES
// ------------------------------

// POST /api/atividade/cadastrar
router.post('/cadastrar', atividadesController.cadastrarAtividade);

// GET /api/atividade/listar
router.get('/listar', atividadesController.listarAtividades);

// GET /api/atividade/voluntario/:codigo
router.get('/voluntario/:codigo', atividadesController.listarPorVoluntario);

// PUT /api/atividade/:id
router.put('/:id', atividadesController.editarAtividade);

// DELETE /api/atividade/:id
router.delete('/:id', atividadesController.deletarAtividade);

module.exports = router;

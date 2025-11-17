// routes/routes_relatorios.js
const express = require('express');
const router = express.Router();

// 🚨 CORREÇÃO CRÍTICA DO CAMINHO: Deve subir da pasta 'routes' para encontrar 'controllers'.
const relatoriosController = require('../controllers/relatoriosController');

// ROTA: POST /api/relatorios/gerar
router.post('/gerar', relatoriosController.gerarRelatorio);

module.exports = router;
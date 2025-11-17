// routes/routes_ponto.js
// Define as rotas para o registro de ponto e cadastro de voluntários.

const express = require('express');
const router = express.Router();
// Importa o Controller que contém a lógica de DB (agora corrigida para usar JSON DB)
const pontoController = require('../controllers/pontoController');

// ROTAS DE CADASTRO DE VOLUNTÁRIO (Prefixadas com /voluntario)
// Corrigido para corresponder aos URLs: /api/ponto/voluntario/cadastrar
router.post('/voluntario/cadastrar', pontoController.cadastrarVoluntario);

// Corrigido para corresponder aos URLs: /api/ponto/voluntario/listar
router.get('/voluntario/listar', pontoController.listarVoluntarios);


// ROTAS DE REGISTRO DE PONTO
// Rota para registrar ponto (ENTRADA / SAÍDA)
router.post('/registrar', pontoController.registrarPonto); 

// Rota para listar todos os pontos (para relatórios internos)
router.get('/pontos', pontoController.listarPontos);

module.exports = router;
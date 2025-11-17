// controllers/pontoController.js
const { insert, findAll, updateById, findOneByCode } = require('../db/index');
const TBL_VOLUNTARIOS = 'voluntarios';
const TBL_PONTOS = 'pontos';

// =========================================================================
// FUNÇÃO DE CADASTRO DE VOLUNTÁRIOS
// (Mantida a mesma, corrigida no passo anterior para evitar "Falha na comunicação")
// =========================================================================
exports.cadastrarVoluntario = async (req, res) => {
    const { codigoCracha, nomeCompleto, urlFoto } = req.body;

    if (!codigoCracha || !nomeCompleto) {
        return res.status(400).json({ error: "Código do Crachá e Nome Completo são obrigatórios." });
    }

    try {
        const existente = await findOneByCode(TBL_VOLUNTARIOS, codigoCracha);
        if (existente) {
            return res.status(409).json({ error: "Voluntário com este código de crachá já cadastrado." });
        }

        const novoVoluntario = {
            id: codigoCracha, 
            codigoCracha: codigoCracha,
            nome: nomeCompleto,
            urlFoto: urlFoto || null,
            dataCadastro: new Date().toISOString()
        };

        await insert(TBL_VOLUNTARIOS, novoVoluntario);

        console.log(`Voluntário cadastrado: ${nomeCompleto} (${codigoCracha})`);
        res.status(201).json({ message: "Voluntário cadastrado com sucesso!", voluntario: novoVoluntario });

    } catch (error) {
        console.error("Erro ao cadastrar voluntário:", error);
        res.status(500).json({ error: "Erro interno do servidor ao cadastrar o voluntário." });
    }
};

// =========================================================================
// FUNÇÃO DE LISTAGEM DE VOLUNTÁRIOS
// (Mantida a mesma, corrigida no passo anterior para evitar "Falha na comunicação")
// =========================================================================
exports.listarVoluntarios = async (req, res) => {
    try {
        const voluntarios = await findAll(TBL_VOLUNTARIOS);
        return res.status(200).json(voluntarios);
    } catch (error) {
        console.error("Erro ao listar voluntários:", error);
        res.status(500).json({ error: "Erro interno do servidor ao listar voluntários." });
    }
};


// =========================================================================
// FUNÇÃO DE REGISTRO DE PONTO (SIMPLIFICADA)
// APENAS REGISTRA UM PONTO SEM LÓGICA IN/OUT
// =========================================================================
exports.registrarPonto = async (req, res) => {
    const { codigoCracha } = req.body;

    if (!codigoCracha) {
        return res.status(400).json({ error: "O Código do Crachá é obrigatório para registro de ponto." });
    }

    try {
        // 1. Verificar se o voluntário existe
        const voluntario = await findOneByCode(TBL_VOLUNTARIOS, codigoCracha);
        if (!voluntario) {
            // Se o código for inválido ou não cadastrado
            return res.status(404).json({ error: "Código do Crachá inválido. Voluntário não encontrado." });
        }

        // 2. Criar novo registro de ponto (sem IN/OUT)
        const novoRegistro = {
            id: Date.now().toString(), // ID único
            codigoCracha: codigoCracha,
            nomeVoluntario: voluntario.nome,
            dataHora: new Date().toISOString(), // Data e hora do registro
            tipo: 'REGISTRO', // Novo tipo genérico
        };

        await insert(TBL_PONTOS, novoRegistro);

        // 3. Retorno de sucesso com a mensagem solicitada
        res.status(200).json({ 
            message: "Ponto Registrado com sucesso.", 
            ponto: novoRegistro,
            voluntario: voluntario
        });

    } catch (error) {
        console.error("Erro ao registrar ponto (Simplificado):", error);
        res.status(500).json({ error: "Erro interno do servidor ao registrar o ponto." });
    }
};


// =========================================================================
// FUNÇÃO DE LISTAGEM DE PONTOS
// =========================================================================
exports.listarPontos = async (req, res) => {
    try {
        const pontos = await findAll(TBL_PONTOS);
        return res.status(200).json(pontos);
    } catch (error) {
        console.error("Erro ao listar pontos:", error);
        res.status(500).json({ error: "Erro interno do servidor ao listar pontos." });
    }
};
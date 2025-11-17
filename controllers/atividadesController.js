// controllers/atividadesController.js
const pool = require('../db/pg_pool');

// Função auxiliar para transformar voluntarios_elegiveis em formato aceito pelo Postgres
function formatArray(voluntarios) {
    if (!voluntarios || voluntarios.length === 0) return null;

    if (Array.isArray(voluntarios)) {
        return `{${voluntarios.join(',')}}`;
    }

    if (typeof voluntarios === 'string') {
        let cleaned = voluntarios.trim();
        if (cleaned.startsWith("{") && cleaned.endsWith("}")) return cleaned;
        return `{${cleaned.split(',').map(v => v.trim()).join(',')}}`;
    }

    return null;
}

// ------------------------------------------------------
// 📌 Cadastrar nova atividade
// ------------------------------------------------------
exports.cadastrarAtividade = async (req, res) => {
    const { nome, data_inicio, data_termino, voluntarios_elegiveis, codigo_assistido } = req.body;

    if (!nome || !data_inicio || !data_termino) {
        return res.status(400).json({ error: 'Nome, data de início e data de término são obrigatórios.' });
    }

    const arrayVol = formatArray(voluntarios_elegiveis);

    try {
        const result = await pool.query(
            `INSERT INTO atividades 
                (nome, data_inicio, data_termino, voluntarios_elegiveis, codigo_assistido)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [nome, data_inicio, data_termino, arrayVol, codigo_assistido || null]
        );

        res.status(201).json({
            success: true,
            message: "Atividade cadastrada com sucesso.",
            atividade: result.rows[0]
        });

    } catch (err) {
        console.error("Erro ao cadastrar atividade:", err);
        res.status(500).json({ error: err.detail || err.message });
    }
};

// ------------------------------------------------------
// 📌 Listar todas as atividades
// ------------------------------------------------------
exports.listarAtividades = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM atividades ORDER BY data_inicio DESC'
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error("Erro ao listar atividades:", err);
        res.status(500).json({ error: err.detail || err.message });
    }
};

// ------------------------------------------------------
// 📌 Listar atividades de um voluntário (código)
// ------------------------------------------------------
exports.listarPorVoluntario = async (req, res) => {
    const { codigo } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM atividades
             WHERE voluntarios_elegiveis @> ARRAY[$1]::varchar[]
             ORDER BY data_inicio DESC`,
            [codigo]
        );

        res.json(result.rows);

    } catch (err) {
        console.error("Erro ao buscar atividades do voluntário:", err);
        res.status(500).json({ error: err.detail || err.message });
    }
};

// ------------------------------------------------------
// 📌 Editar atividade
// ------------------------------------------------------
exports.editarAtividade = async (req, res) => {
    const { id } = req.params;
    const { nome, data_inicio, data_termino, voluntarios_elegiveis, codigo_assistido } = req.body;

    if (!id || !nome || !data_inicio || !data_termino) {
        return res.status(400).json({ error: 'ID, nome, data de início e data de término são obrigatórios.' });
    }

    const arrayVol = formatArray(voluntarios_elegiveis);

    try {
        const result = await pool.query(
            `UPDATE atividades
             SET nome = $1,
                 data_inicio = $2,
                 data_termino = $3,
                 voluntarios_elegiveis = $4,
                 codigo_assistido = $5
             WHERE id = $6
             RETURNING *`,
            [nome, data_inicio, data_termino, arrayVol, codigo_assistido || null, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Atividade não encontrada' });
        }

        res.json({ success: true, message: "Atividade atualizada com sucesso.", atividade: result.rows[0] });

    } catch (err) {
        console.error("Erro ao editar atividade:", err);
        res.status(500).json({ error: err.detail || err.message });
    }
};

// ------------------------------------------------------
// 📌 Deletar atividade
// ------------------------------------------------------
exports.deletarAtividade = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'ID da atividade é obrigatório.' });

    try {
        const result = await pool.query('DELETE FROM atividades WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Atividade não encontrada' });
        }

        res.json({ success: true, message: 'Atividade excluída com sucesso.' });

    } catch (err) {
        console.error("Erro ao deletar atividade:", err);
        res.status(500).json({ error: err.detail || err.message });
    }
};

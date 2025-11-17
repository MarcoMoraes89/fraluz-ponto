// controller/cursosController.js
import pool from '../config/db.js';

// ====================================================
// CADASTRAR CURSO
// ====================================================
export async function cadastrarCurso(req, res) {
    const { nome, descricao, voluntarios } = req.body;

    if (!nome) {
        return res.status(400).json({ success: false, error: 'O nome é obrigatório.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO cursos (nome, descricao, voluntarios_participantes)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nome, descricao || null, voluntarios || []]
        );

        res.json({ success: true, curso: result.rows[0] });

    } catch (err) {
        console.error('Erro ao cadastrar curso:', err);
        res.status(500).json({ success: false, error: 'Erro interno ao cadastrar curso.' });
    }
}

// ====================================================
// LISTAR CURSOS
// ====================================================
export async function listarCursos(req, res) {
    try {
        const result = await pool.query(`SELECT * FROM cursos ORDER BY id DESC`);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar cursos:', err);
        res.status(500).json({ success: false, error: 'Erro interno ao listar cursos.' });
    }
}

// ====================================================
// EXCLUIR CURSO
// ====================================================
export async function excluirCurso(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query(`DELETE FROM cursos WHERE id = $1`, [id]);
        res.json({ success: true });

    } catch (err) {
        console.error('Erro ao excluir curso:', err);
        res.status(500).json({ success: false, error: 'Erro interno ao excluir curso.' });
    }
}

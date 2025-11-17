require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve HTML, CSS, JS

// ============================
// CONFIGURAÇÃO DO POSTGRES
// ============================
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

pool.connect()
    .then(() => console.log("✅ Conectado ao banco de dados PostgreSQL!"))
    .catch(err => console.error("Erro ao conectar ao PostgreSQL:", err));

// ============================
// ROTAS VOLUNTÁRIOS
// ============================
app.get('/api/voluntario/listar', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM voluntarios ORDER BY nome');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/voluntario/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const result = await pool.query('SELECT * FROM voluntarios WHERE codigo = $1', [codigo]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Voluntário não encontrado' });
        const voluntario = result.rows[0];
        if (voluntario.aptidoes && typeof voluntario.aptidoes === 'string') {
            voluntario.aptidoes = voluntario.aptidoes.replace(/^{|}$/g, '').split(',').map(a => a.replace(/^"(.*)"$/, '$1'));
        }
        res.json(voluntario);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/voluntario', async (req, res) => {
    const { codigo, nome, telefone, endereco, nascimento, aptidoes, url_foto } = req.body;
    try {
        await pool.query(
            `INSERT INTO voluntarios (codigo, nome, telefone, endereco, nascimento, aptidoes, url_foto)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [codigo, nome, telefone || null, endereco || null, nascimento || null, aptidoes || [], url_foto || null]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/voluntario/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const { codigo_novo, nome, telefone, endereco, nascimento, aptidoes, url_foto } = req.body;
    try {
        const result = await pool.query(
            `UPDATE voluntarios SET codigo=$1, nome=$2, telefone=$3, endereco=$4, nascimento=$5, aptidoes=$6, url_foto=$7
             WHERE codigo=$8`,
            [codigo_novo || codigo, nome, telefone || null, endereco || null, nascimento || null, aptidoes || [], url_foto || null, codigo]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Voluntário não encontrado' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/voluntario/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const result = await pool.query('DELETE FROM voluntarios WHERE codigo = $1', [codigo]);
        if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Voluntário não encontrado' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================
// ROTAS ATIVIDADES
// ============================
function parseVoluntariosElegiveis(input) {
    if (!input) return null;
    if (typeof input === "string" && input.startsWith("{") && input.endsWith("}")) return input;
    return `{${Array.isArray(input) ? input.join(",") : input}}`;
}

app.post('/api/atividade/cadastrar', async (req, res) => {
    const { nome, data_inicio, data_termino, voluntarios_elegiveis } = req.body;
    const arrayVol = parseVoluntariosElegiveis(voluntarios_elegiveis);
    try {
        const result = await pool.query(
            `INSERT INTO atividades (nome, data_inicio, data_termino, voluntarios_elegiveis)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [nome, data_inicio, data_termino, arrayVol]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/atividade/listar', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM atividades ORDER BY data_inicio DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/atividade/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, data_inicio, data_termino, voluntarios_elegiveis } = req.body;
    const arrayVol = parseVoluntariosElegiveis(voluntarios_elegiveis);
    try {
        const result = await pool.query(
            `UPDATE atividades SET nome=$1, data_inicio=$2, data_termino=$3, voluntarios_elegiveis=$4
             WHERE id=$5 RETURNING *`,
            [nome, data_inicio, data_termino, arrayVol, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Atividade não encontrada' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/atividade/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM atividades WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Atividade não encontrada' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/atividade/voluntario/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM atividades WHERE $1 = ANY(voluntarios_elegiveis) ORDER BY data_inicio DESC`,
            [codigo]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ============================
// ROTAS CURSOS
// ============================
function parseVoluntariosArray(input) {
    if (!input) return null;
    if (Array.isArray(input)) return `{${input.join(",")}}`;
    return input;
}

app.get('/api/curso/listar', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cursos ORDER BY nome');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cursos/voluntario/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM cursos WHERE $1 = ANY(voluntarios_participantes) ORDER BY nome`,
            [codigo]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/curso/cadastrar', async (req, res) => {
    const { nome, descricao, voluntarios } = req.body;
    const arrayVol = parseVoluntariosArray(voluntarios);
    try {
        await pool.query(
            `INSERT INTO cursos (nome, descricao, voluntarios_participantes)
             VALUES ($1,$2,$3)`,
            [nome, descricao || null, arrayVol]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/curso/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, voluntarios } = req.body;
    const arrayVol = parseVoluntariosArray(voluntarios);
    try {
        const result = await pool.query(
            `UPDATE cursos
             SET nome=$1, descricao=$2, voluntarios_participantes=$3
             WHERE id=$4`,
            [nome, descricao || null, arrayVol, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Curso não encontrado' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/curso/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM cursos WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Curso não encontrado' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================
// REGISTRO DE PONTO
// ============================
app.post('/api/ponto/registrar', async (req, res) => {
    const { codigo_voluntario, tipo } = req.body;
    try {
        await pool.query(
            `INSERT INTO registro_ponto (codigo_voluntario, tipo) VALUES ($1,$2)`,
            [codigo_voluntario, tipo]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/ponto/listar', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM registro_ponto ORDER BY data_hora DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ============================
// INICIAR SERVIDOR
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`➡ Abra: http://localhost:${PORT}`);
});
